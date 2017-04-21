import { expect } from 'chai';
import sinon from 'sinon';

import Schema from '../../src/js/Schema';

describe('Schema class', () => {
    let schema;

    describe('#constructor', () => {
        const idSchema = new Schema(),
            schemas = [
                undefined,
                { id: { type: Number, required: true } },
                { id: String, itemRef: idSchema },
                { id: String, data: [Number] },
                { id: { type: String, required: true }, data: [idSchema] }
            ];

        beforeEach(() => {
            schema = new Schema(schemas.shift());
        });

        it('should create a Schema object successfully using defaults', () => {
            expect(schema).to.exist;

            expect(schema.validate).to.be.a('function');
            expect(schema.assertType).to.be.a('function');
            expect(schema.iterator).to.be.a('generatorfunction');
            expect(schema.assign).to.be.a('function');
            expect(schema.evalProperty).to.be.a('function');

            expect(schema.id).to.equal(String);
        });

        it('should create a Schema object successfully using a more complex property', () => {
            expect(schema.id.type).to.equal(Number);
            expect(schema.id.required).to.be.true;
        });

        it('should create a Schema object successfully using another Schema as a property', () => {
            expect(schema.id).to.equal(String);
            expect(schema.itemRef).to.be.an.instanceof(Schema);
            expect(schema.itemRef.id).to.equal(String);
        });

        it('should create a Schema object successfully using a property defined as an Array', () => {
            expect(schema.id).to.equal(String);
            expect(schema.data).to.be.an.instanceof(Array);
            expect(schema.data[0]).to.equal(Number);
        });

        it('should create a Schema object successfully using a more complex property and another as an Array', () => {
            expect(schema.id.type).to.equal(String);
            expect(schema.id.required).to.be.true;
            expect(schema.data).to.be.an.instanceof(Array);
            expect(schema.data[0]).to.be.an.instanceof(Schema);
        });

        afterEach(() => {
            schema = null;
        });
    });

    describe('#validate', () => {
        const schemas = [
            undefined,
            { id: { type: String } },
            { id: { type: String, required: true } },
            { id: { type: String, required: true } },
            { id: { type: String, validate: () => true } },
            { id: { type: String, validate: sinon.stub().throws('Error') } }
        ],
        data = [
            'id',
            'id',
            'id',
            undefined,
            'id',
            'id'
        ];
        let assertTypeStub;

        beforeEach(() => {
            assertTypeStub = sinon.stub().returns(true);

            schema = new Schema(schemas.shift());
            schema.assertType = assertTypeStub;
        });

        it('should run without error for default type assertion', () => {
            schema.validate(data.shift(), schema.id);

            expect(assertTypeStub.calledOnce).to.be.true;
        });

        it('should run without error for type property definition', () => {
            schema.validate(data.shift(), schema.id);

            expect(assertTypeStub.calledOnce).to.be.true;
        });

        it('should run without error for required value', () => {
            schema.validate(data.shift(), schema.id);

            expect(assertTypeStub.calledOnce).to.be.true;
        });

        it('should throw error for required value', () => {
            expect(() => schema.validate(data.shift(), schema.id)).to.throw(ReferenceError);

            expect(assertTypeStub.called).to.be.false;
        });

        it('should run without error for assigned custom validate function', () => {
            schema.validate(data.shift(), schema.id);

            expect(assertTypeStub.calledOnce).to.be.true;
        });

        it('should throw error for assigned custom validate function', () => {
            expect(() => schema.validate(data.shift(), schema.id)).to.throw(Error);

            expect(assertTypeStub.calledOnce).to.be.true;
        });

        afterEach(() => {
            schema = null;
        });
    });

    describe('#assertType', () => {
        const testSchema = new Schema(),
            values = [ [], 'test', 0 ],
            types = [
                [testSchema],
                String,
                String
            ];

        beforeEach(() => {
            schema = new Schema();
        });

        it('should return true if Array assertion passed', () => {
            expect(schema.assertType(values.shift(), types.shift())).to.be.true;
        });

        it('should return true if type assertion passed', () => {
            expect(schema.assertType(values.shift(), types.shift())).to.be.true;
        });

        it('should throw error if type assertion failed', () => {
            expect(() => schema.assertType(values.shift(), types.shift())).to.throw(TypeError);
        });

        afterEach(() => {
            schema = null;
        });
    });

    describe('#evalProperty', () => {
        const values = [ () => 'function', 'value' ];
        let result;

        beforeEach(() => {
            schema = new Schema();

            result = schema.evalProperty(values.shift());
        });

        it('should call the function passed', () => {
            expect(result).to.be.a('string');
            expect(result).to.equal('function');
        });

        it('should return the value passed', () => {
            expect(result).to.be.a('string');
            expect(result).to.equal('value');
        });

        afterEach(() => {
            schema = null;
            result = null;
        });
    });

});
