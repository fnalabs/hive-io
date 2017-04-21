import { expect } from 'chai';

import Model from '../../src/js/Model';
import Schema from '../../src/js/Schema';


describe('Model class', () => {
    let model;

    describe('#constructor', () => {
        before(() => {
            model = new Model();
        });

        it('should create a Model object successfully using defaults', () => {
            expect(model).to.exist;

            expect(model.create).to.be.a('function');
            expect(model.update).to.be.a('function');
            expect(model.iterator).to.be.a('generatorfunction');
            expect(model.assign).to.be.a('function');
        });

        after(() => {
            model = null;
        });
    });

    describe('#create', () => {
        const schemas = [
            new Schema(),
            new Schema(),
            new Schema({ id: { type: String, default: 'stub' } }),
            new Schema({ id: { type: String, default: 'stub' } }),
            new Schema({ id: { type: String, value: 'stub' } }),
            new Schema({ id: String, itemRef: new Schema() }),
            new Schema({ id: String, meta: new Schema({ created: { type: Number, default: Date.now } }) }),
            new Schema({ id: String, availableRefs: [new Schema()] })
        ];
        const data = [
            { id: 'id' },
            { id: 0 },
            { id: 'id' },
            { test: 'test' },
            { id: 'id' },
            { id: 'id', itemRef: { id: 'id' } },
            { id: 'id', meta: { created: null } },
            { id: 'id', availableRefs: [{ id: 'id1' }, { id: 'id2' }] }
        ];

        it('should return the test object unmodified', () => {
            model = new Model(data.shift(), schemas.shift());

            expect(model).to.be.an('object');

            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('id');
        });

        it('should throw a TypeError', () => {
            expect(() => new Model(data.shift(), schemas.shift())).to.throw(TypeError);
        });

        it('should return the test object with the provided value', () => {
            model = new Model(data.shift(), schemas.shift());

            expect(model).to.be.an('object');

            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('id');
        });

        it('should return the test object with the default from the schema', () => {
            model = new Model(data.shift(), schemas.shift());

            expect(model).to.be.an('object');

            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('stub');

            expect(model.test).to.be.a('string');
            expect(model.test).to.equal('test');
        });

        it('should return the test object with the value from the schema', () => {
            model = new Model(data.shift(), schemas.shift());

            expect(model).to.be.an('object');

            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('stub');
        });

        it('should return the test object with the provided nested model data', () => {
            model = new Model(data.shift(), schemas.shift());

            expect(model).to.be.an('object');

            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('id');

            expect(model.itemRef.id).to.be.a('string');
            expect(model.itemRef.id).to.equal('id');
        });

        it('should return the test object with the complex nested object literal', () => {
            model = new Model(data.shift(), schemas.shift());

            expect(model).to.be.an('object');

            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('id');

            expect(model.meta.created).to.be.a('number');
        });

        it('should return the test object with a nested array of schemas', () => {
            model = new Model(data.shift(), schemas.shift());

            expect(model).to.be.an('object');

            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('id');

            expect(model.availableRefs[0].id).to.be.a('string');
            expect(model.availableRefs[0].id).to.equal('id1');

            expect(model.availableRefs[1].id).to.be.a('string');
            expect(model.availableRefs[1].id).to.equal('id2');
        });

        afterEach(() => {
            model = null;
        });
    });

    describe('#update', () => {
        const schemas = [
            new Schema(),
            new Schema({ id: { type: String, default: 'stub' } }),
            new Schema({ id: { type: String, value: 'stub' } }),
            new Schema({ id: new Schema() }),
            new Schema({ id: String, meta: new Schema({ updated: { type: Number, default: Date.now } }) }),
            new Schema({ id: String, availableRefs: [new Schema()] })
        ];
        const data = [
            { id: 'id' },
            { id: 'id' },
            { id: 'id' },
            { id: { id: 'id' } },
            { id: 'id', meta: { updated: null } },
            { id: 'id', availableRefs: [{ id: 'id1' }, { id: 'id2' }] }
        ];
        const update = [
            { id: 'update' },
            { id: 'update' },
            { id: 'update' },
            { id: { id: 'update' } },
            { id: 'update', meta: { updated: Date.now() } },
            { id: 'update', availableRefs: [{ id: 'id1' }, { id: 'id2' }, { id: 'id3' }] }
        ];

        beforeEach(() => {
            model = new Model(data.shift(), schemas.shift());
        });

        it('should return the updated test object', () => {
            expect(model).to.be.an('object');
            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('id');

            model.update(update.shift());

            expect(model).to.be.an('object');
            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('update');
        });

        it('should return the test object unmodified even with a default value defined', () => {
            expect(model).to.be.an('object');
            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('id');

            model.update(update.shift());

            expect(model).to.be.an('object');
            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('update');
        });

        it('should return the test object with the provided value', () => {
            expect(model).to.be.an('object');
            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('stub');

            model.update(update.shift());

            expect(model).to.be.an('object');
            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('stub');
        });

        it('should return the test object with the provided nested model data', () => {
            expect(model).to.be.an('object');
            expect(model.id).to.be.an('object');
            expect(model.id.id).to.be.a('string');
            expect(model.id.id).to.equal('id');

            model.update(update.shift());

            expect(model).to.be.an('object');
            expect(model.id).to.be.an('object');
            expect(model.id.id).to.be.a('string');
            expect(model.id.id).to.equal('update');
        });

        it('should return the test object with the provided nested model meta data', () => {
            expect(model).to.be.an('object');
            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('id');
            expect(model.meta.updated).to.be.a('number');

            model.update(update.shift());

            expect(model).to.be.an('object');
            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('update');
            expect(model.meta.updated).to.be.a('number');
        });

        it('should return the test object with the provided nested model array data', () => {
            expect(model).to.be.an('object');
            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('id');
            expect(model.availableRefs[0].id).to.be.a('string');
            expect(model.availableRefs[0].id).to.equal('id1');
            expect(model.availableRefs[1].id).to.be.a('string');
            expect(model.availableRefs[1].id).to.equal('id2');

            model.update(update.shift());

            expect(model).to.be.an('object');
            expect(model.id).to.be.a('string');
            expect(model.id).to.equal('update');
            expect(model.availableRefs[0].id).to.be.a('string');
            expect(model.availableRefs[0].id).to.equal('id1');
            expect(model.availableRefs[1].id).to.be.a('string');
            expect(model.availableRefs[1].id).to.equal('id2');
            expect(model.availableRefs[2].id).to.be.a('string');
            expect(model.availableRefs[2].id).to.equal('id3');
        });

        afterEach(() => {
            model = null;
        });
    });

});
