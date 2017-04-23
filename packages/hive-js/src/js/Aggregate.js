import Model from './Model';


export default class Aggregate extends Model {

    constructor(data = {}, spec) {
        super(data, spec);
    }

    /*
     * apply methods
     */
    applyEvent(data) {
        if (data.sequence !== this.version + 1) throw new RangeError(`${data.name} out of sequence`);

        return this.update(data);
    }

    applySequence(data) {
        return data.reduce((ret, log) => this.update(log), this);
    }

    /*
     * update override
     */
    update(data) {
        if (data.sequence) data.version = data.sequence;

        super.update(data);
    }

}
