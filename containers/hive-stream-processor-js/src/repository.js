import CONFIG from '../config/appConfig';

import Redis from 'ioredis';
import Redlock from 'redlock';
import uuidV4 from 'uuid/v4';

const CACHE = Symbol('reference to cache client connection object');
const LOCK = Symbol('reference to optimistic locking connection object');
const STORE = Symbol('reference to Event Store client connection object');


export default class Repository {

    constructor(store) {
        this[CACHE] = new Redis(CONFIG.CACHE_URL);
        this[LOCK] = new Redlock([this[CACHE]], {
            // the expected clock drift; for more details
            // see http://redis.io/topics/distlock
            driftFactor: CONFIG.LOCK_DRIFT_FACTOR, // time in ms
            // the max number of times Redlock will attempt
            // to lock a resource before erroring
            retryCount: CONFIG.LOCK_RETRY_COUNT,
            // the time in ms between attempts
            retryDelay: CONFIG.LOCK_RETRY_DELAY, // time in ms
            // the max time in ms randomly added to retries
            // to improve performance under high contention
            // see https://www.awsarchitectureblog.com/2015/03/backoff.html
            retryJitter: CONFIG.LOCK_RETRY_JITTER // time in ms
        });
        this[STORE] = store;

        // TODO add errors to log
        this[LOCK].on('clientError', (err) => {
            console.log('A redis error has occurred:', err);
        });
    }

    create(id = uuidV4(), Ctor) {
        return new Ctor(id);
    }

    delete = async id => {
        return await this[CACHE].del(id);
    }

    get = async (id, Ctor) => {
        return await this[CACHE].get(id).then(result => new Ctor(id, JSON.parse(result)));
    }

    record = async event => {
        await this[LOCK].lock(event.id, CONFIG.LOCK_TTL).then(async (lock) => {
            await this[STORE].log(event);

            return lock.unlock();
        });
    }

    update = async aggregate => {
        const cache = aggregate.cache;

        await this[LOCK].lock(cache.id, CONFIG.LOCK_TTL).then(async (lock) => {
            await this[CACHE].set(cache.id, JSON.stringify(cache));

            return lock.unlock();
        });
    }

}
