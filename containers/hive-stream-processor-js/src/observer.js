// imports
import { from, fromEventPattern } from 'rxjs'
import { concatMap } from 'rxjs/operators'

/*
 * EventObserver class
 */
export default class EventObserver {
  constructor (actor, repository, store, isConsumer, isProducer) {
    const isStreamProcessor = !isConsumer && !isProducer

    /* istanbul ignore next */
    async function execute (value) {
      const aggregate = await actor.replay(value)
      const ret = await actor.perform(aggregate.model, value)
      if (isConsumer) await repository.update(ret.id, ret.model)
      if (isStreamProcessor && ret) await store.log(ret.id, ret.model)
    }

    // bootstrap event observer
    /* istanbul ignore next */
    fromEventPattern(handler => store.consumer.on('data', handler))
      .pipe(concatMap(event => from(execute(JSON.parse(event.value.toString())))))
      .subscribe(() => {})
  }
}
