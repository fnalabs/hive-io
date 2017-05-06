import { expect } from 'chai';

import Aggregate from '../../src/js/Aggregate';
import Schema from '../../src/js/Schema';

describe('Aggregate class', () => {
    let aggregate;

    describe('#constructor', () => {
        const data = [
            undefined,
            [{ id: 'id', sequence: 1 }, { id: 'id', sequence: 2 }, { id: 'id', sequence: 3 }],
            { id: 'id', version: 1 },
            { id: 'id', version: 1, sequence: 1 },
            { id: 'id', version: 1, sequence: 1, name: 'Create' }
        ];
        const schemas = [
            new Schema(),
            new Schema({ id: String, version: Number }),
            new Schema({ id: String, version: Number }),
            new Schema({ id: String, version: Number }),
            new Schema({ id: String, version: Number })
        ];

        it('should create the initial Aggregate object with no data', () => {
            aggregate = new Aggregate(data.shift(), schemas.shift());

            expect(aggregate).to.exist;

            expect(aggregate.applyData).to.be.a('function');
            expect(aggregate.applySequence).to.be.a('function');
            expect(aggregate.update).to.be.a('function');

            expect(aggregate.id).to.be.undefined;
        });

        it('should create the initial Aggregate object with the suggested sequence approach', () => {
            const sequence = data.shift();

            aggregate = new Aggregate({}, schemas.shift()).applySequence(sequence);

            expect(aggregate).to.exist;

            expect(aggregate.applyData).to.be.a('function');
            expect(aggregate.applySequence).to.be.a('function');
            expect(aggregate.update).to.be.a('function');

            expect(aggregate.id).to.be.a('string');
            expect(aggregate.id).to.equal('id');

            expect(aggregate.version).to.be.a('number');
            expect(aggregate.version).to.equal(3);
        });

        it('should create a fully initialized Aggregate object with data', () => {
            aggregate = new Aggregate(data.shift(), schemas.shift());

            expect(aggregate).to.exist;

            expect(aggregate.id).to.be.a('string');
            expect(aggregate.id).to.equal('id');

            expect(aggregate.version).to.be.a('number');
            expect(aggregate.version).to.equal(1);
        });

        it('should create a fully initialized Aggregate object without sequence data', () => {
            aggregate = new Aggregate(data.shift(), schemas.shift());

            expect(aggregate).to.exist;

            expect(aggregate.id).to.be.a('string');
            expect(aggregate.id).to.equal('id');

            expect(aggregate.version).to.be.a('number');
            expect(aggregate.version).to.equal(1);

            expect(aggregate.sequence).to.be.undefined;
        });

        it('should create a fully initialized Aggregate object without sequence and name data', () => {
            aggregate = new Aggregate(data.shift(), schemas.shift());

            expect(aggregate).to.exist;

            expect(aggregate.id).to.be.a('string');
            expect(aggregate.id).to.equal('id');

            expect(aggregate.version).to.be.a('number');
            expect(aggregate.version).to.equal(1);

            expect(aggregate.sequence).to.be.undefined;
            expect(aggregate.name).to.be.undefined;
        });

        after(() => {
            aggregate = null;
        });
    });

    describe('#applyData', () => {
        const events = [
                { id: 'id', sequence: 1 },
                { id: 'id', sequence: 0 }
            ],
            schemas = [
                new Schema({ id: String, version: Number }),
                new Schema({ id: String, version: Number })
            ];

        beforeEach(() => {
            aggregate = new Aggregate({ id: 'id', version: 0 }, schemas.shift());
        });

        it('should apply a single event successfully', () => {
            aggregate.applyData(events.shift());

            expect(aggregate.id).to.be.a('string');
            expect(aggregate.id).to.equal('id');

            expect(aggregate.version).to.be.a('number');
            expect(aggregate.version).to.equal(1);
        });

        it('should throw a RangeError if there is a version/sequence mismatch', () => {
            expect(() => aggregate.applyData(events.shift())).to.throw(RangeError);
        });

        afterEach(() => {
            aggregate = null;
        });
    });

    describe('#applySequence', () => {
        const sequence = [{ id: 'id', sequence: 0 }, { id: 'id', sequence: 1 }],
            schema = new Schema({ id: String, version: Number });

        before(() => {
            aggregate = new Aggregate({}, schema);
        });

        it('should apply a sequence of events', () => {
            aggregate.applySequence(sequence);

            expect(aggregate.id).to.be.a('string');
            expect(aggregate.id).to.equal('id');

            expect(aggregate.version).to.be.a('number');
            expect(aggregate.version).to.equal(1);
        });

        after(() => {
            aggregate = null;
        });
    });

});
