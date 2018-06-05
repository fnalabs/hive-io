// imports
import { from, fromEventPattern } from 'rxjs'
import { concatMap } from 'rxjs/operators'

/*
 * EventObserver class
 */
export default class EventObserver {
  constructor (actor, repository, store, isConsumer) {
    /* istanbul ignore next */
    async function execute (value) {
      const aggregate = await actor.replay(value)
      const { id, model } = await actor.perform(aggregate.model, value)
      if (isConsumer) await repository.update(id, model)
    }

    // bootstrap event observer
    /* istanbul ignore next */
    fromEventPattern(handler => store.consumer.on('data', handler))
      .pipe(concatMap(event => from(execute(JSON.parse(event.value.toString())))))
      .subscribe(() => {})
  }
}
