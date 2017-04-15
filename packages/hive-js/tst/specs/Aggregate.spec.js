import { expect } from 'chai';
import sinon from 'sinon';

import Aggregate from '../../src/js/Aggregate';

describe('Aggregate class', () => {
    let aggregate;

    describe('#constructor', () => {
        const data = [undefined, { id: 'id', sequence: 1 }];

        beforeEach(() => {
            aggregate = new Aggregate('id', {}, data.shift());
        });

        it('should create the initial Aggregate object with no data', () => {
            expect(aggregate).to.exist;

            expect(aggregate.cache.id).to.equal('id');
            expect(aggregate.cache.version).to.equal(-1);
            expect(aggregate.schema).to.be.an('object');

            expect(aggregate.apply).to.be.a('function');
            expect(aggregate.applySequence).to.be.a('function');
            expect(aggregate.validate).to.be.a('function');
        });

        it('should create a fully initialized Aggregate object with data', () => {
            expect(aggregate).to.exist;

            expect(aggregate.cache.version).to.equal(1);
        });

        after(() => {
            aggregate = null;
        });
    });

    describe('#apply', () => {
        const data = [{ id: 'id', sequence: 0 }, [{ id: 'id', sequence: 0 }]];
        let applySequenceSpy, result;

        beforeEach(() => {
            applySequenceSpy = sinon.spy();

            aggregate = new Aggregate('id', {});
            aggregate.applySequence = applySequenceSpy;

            result = aggregate.apply(data.shift());
        });

        it('should apply a single event', () => {
            expect(applySequenceSpy.called).to.be.false;

            expect(result.id).to.be.a('string');
            expect(result.id).to.equal('id');

            expect(result.version).to.be.a('number');
            expect(result.version).to.equal(0);
        });

        it('should apply a sequence of events', () => {
            expect(applySequenceSpy.calledOnce).to.be.true;
            expect(applySequenceSpy.calledWith([{ id: 'id', sequence: 0 }])).to.be.true;
        });

        afterEach(() => {
            applySequenceSpy = null;
            aggregate = null;
        });
    });

    describe('#applySequence', () => {
        const data = [{ id: 'id', sequence: 0 }, { id: 'id', sequence: 1 }];
        let applyStub, result;

        before(() => {
            applyStub = sinon.stub().returns({ id: 'stub', version: 100 });

            aggregate = new Aggregate('id', {});
            aggregate.apply = applyStub;

            result = aggregate.applySequence(data);
        });

        it('should apply a sequence of events', () => {
            expect(applyStub.calledTwice).to.be.true;

            expect(result.id).to.be.a('string');
            expect(result.id).to.equal('stub');

            expect(result.version).to.be.a('number');
            expect(result.version).to.equal(100);
        });

        after(() => {
            applyStub = null;
            aggregate = null;
        });
    });

    describe('#validate', () => {
        const data = [{ id: 'id', sequence: 0 }, { id: 'id', sequence: 1 }];
        let schemaValidateStub, result;

        beforeEach(() => {
            schemaValidateStub = sinon.stub().returns(true);

            aggregate = new Aggregate('id', { validate: schemaValidateStub });

            result = aggregate.validate(data.shift());
        });

        it('should successfully validate the data against the aggregate\'s current state', () => {
            expect(schemaValidateStub.calledOnce).to.be.true;

            expect(result).to.be.a('boolean');
            expect(result).to.equal(true);
        });

        it('should unsuccessfully validate the data due to sequence error', () => {
            expect(schemaValidateStub.called).to.be.false;

            expect(result).to.be.a('boolean');
            expect(result).to.equal(false);
        });

        afterEach(() => {
            schemaValidateStub = null;
            aggregate = null;
            result = null;
        });
    });

});
