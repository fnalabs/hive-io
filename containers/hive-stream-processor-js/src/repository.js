import CONFIG from '../conf/appConfig';

import Redis from 'ioredis';
import Redlock from 'redlock';

// private properties
const CACHE = Symbol('reference to cache client connection object');
const LOCK = Symbol('reference to pessimistic locking connection object');
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

        // handle client errors
        this[CACHE].on('error', err => {
            console.log('A redis error has occurred:', err);
        });
        this[LOCK].on('clientError', (err) => {
            console.log('A redlock error has occurred:', err);
        });

        // quit connection if process is interrupted
        process.on('SIGINT', () => this[CACHE].quit());
        process.on('SIGUSR2', () => this[CACHE].quit());
    }

    delete = async id => {
        return await this[CACHE].del(id);
    }

    get = async (id, Aggregate) => {
        const data = await this[CACHE].get(id);

        return new Aggregate(JSON.parse(data || '{}'));
    }

    record = async (event, aggregate) => {
        const key = this.getKey(aggregate, aggregate.constructor.name);

        await this[LOCK].lock(`lock:${key}`, CONFIG.LOCK_TTL).then(async (lock) => {
            await this[STORE].log(event);
            await this[CACHE].set(key, JSON.stringify(aggregate));

            return lock.unlock();
        });
    }

    update = async aggregate => {
        const key = this.getKey(aggregate, aggregate.constructor.name);

        await this[LOCK].lock(`lock:${key}`, CONFIG.LOCK_TTL).then(async (lock) => {
            await this[CACHE].set(key, JSON.stringify(aggregate));

            return lock.unlock();
        });
    }

    getKey(data, name) {
        if (!data.id) return null;
        return data.id.id ? `${name}:${data.id.id}` : data.id;
    }

}
