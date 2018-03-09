// imports
import { Observable } from 'rxjs/Rx'

/*
 * EventObserver class
 */
export default class EventObserver {
  constructor (actor, repository, store, isConsumer) {
    /* istanbul ignore next */
    async function execute (value) {
      const aggregate = await actor.replay(value, repository)
      const { id, model } = await actor.perform(value, aggregate, repository)
      if (isConsumer) await repository.update(id, model)
    }

    // bootstrap event observer
    /* istanbul ignore next */
    Observable
      .fromEventPattern(handler => store.consumer.on('message', handler))
      .concatMap(event => Observable.fromPromise(execute(JSON.parse(event.value))))
      .subscribe(() => {})
  }
}
