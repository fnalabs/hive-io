import { expect } from 'chai';
import sinon from 'sinon';

import Schema from '../../src/js/Schema';

describe('Schema class', () => {
    let schema;

    describe('#constructor', () => {
        const schemas = [undefined, { id: String }];

        beforeEach(() => {
            schema = new Schema(schemas.shift());
        });

        it('should create a Schema object successfully using defaults', () => {
            expect(schema).to.exist;

            expect(schema.create).to.be.a('function');
            expect(schema.update).to.be.a('function');
            expect(schema.validate).to.be.a('function');
            expect(schema.assertType).to.be.a('function');
            expect(schema.assertList).to.be.a('function');
            expect(schema.evalProperty).to.be.a('function');

            expect(schema.spec.id.name).to.equal('String');
        });

        it('should create a Schema object successfully using a custom schema definition', () => {
            expect(schema).to.exist;

            expect(schema.spec.id.name).to.equal('String');
            expect(schema.spec.version).to.be.undefined;
        });

        afterEach(() => {
            schema = null;
        });
    });

    describe('#create', () => {
        const idSchema = new Schema();
        const schemas = [
            undefined,
            { id: { default: 'stub' } },
            { id: { value: 'stub' } },
            { id: idSchema }
        ];
        const data = [
            { id: 'id' },
            { id: 'id' },
            { id: 'id' },
            { id: { id: 'id' } }
        ];
        let evalPropertyStub, result;

        beforeEach(() => {
            evalPropertyStub = sinon.stub().returns('stub');

            schema = new Schema(schemas.shift());
            schema.evalProperty = evalPropertyStub;

            result = schema.create(data.shift());
        });

        it('should return the test object unmodified', () => {
            expect(result).to.be.an('object');

            expect(result.id).to.be.a('string');
            expect(result.id).to.equal('id');

            expect(evalPropertyStub.called).to.be.false;
        });

        it('should return the test object with the provided default', () => {
            expect(result).to.be.an('object');

            expect(result.id).to.be.a('string');
            expect(result.id).to.equal('stub');

            expect(evalPropertyStub.calledOnce).to.be.true;
        });

        it('should return the test object with the provided value', () => {
            expect(result).to.be.an('object');

            expect(result.id).to.be.a('string');
            expect(result.id).to.equal('stub');

            expect(evalPropertyStub.calledOnce).to.be.true;
        });

        it('should return the test object with the provided nested schema data', () => {
            expect(result).to.be.an('object');

            expect(result.id.id).to.be.a('string');
            expect(result.id.id).to.equal('id');

            expect(evalPropertyStub.called).to.be.false;
        });

        afterEach(() => {
            schema = null;
            result = null;
        });
    });

    describe('#update', () => {
        const idSchema = new Schema();
        const schemas = [
            undefined,
            { id: { default: 'stub' } },
            { id: { value: 'stub' } },
            { id: idSchema }
        ];
        const data = [
            { id: 'id' },
            { id: 'id' },
            { id: 'id' },
            { id: { id: 'id' } }
        ];
        let evalPropertyStub, result;

        beforeEach(() => {
            evalPropertyStub = sinon.stub().returns('stub');

            schema = new Schema(schemas.shift());
            schema.evalProperty = evalPropertyStub;

            result = schema.update(data.shift());
        });

        it('should return the test object unmodified', () => {
            expect(result).to.be.an('object');

            expect(result.id).to.be.a('string');
            expect(result.id).to.equal('id');

            expect(evalPropertyStub.called).to.be.false;
        });

        it('should return the test object unmodified even with a default value defined', () => {
            expect(result).to.be.an('object');

            expect(result.id).to.be.a('string');
            expect(result.id).to.equal('id');

            expect(evalPropertyStub.called).to.be.false;
        });

        it('should return the test object with the provided value', () => {
            expect(result).to.be.an('object');

            expect(result.id).to.be.a('string');
            expect(result.id).to.equal('stub');

            expect(evalPropertyStub.calledOnce).to.be.true;
        });

        it('should return the test object with the provided nested schema data', () => {
            expect(result).to.be.an('object');

            expect(result.id.id).to.be.a('string');
            expect(result.id.id).to.equal('id');

            expect(evalPropertyStub.called).to.be.false;
        });

        afterEach(() => {
            schema = null;
            result = null;
        });
    });

    describe('#validate', () => {
        const idSchema = new Schema();
        const schemas = [
            undefined,
            { id: { type: String } },
            { id: idSchema },
            { id: { type: String, required: true } },
            { id: { type: String, required: true } },
            { id: { type: String, validate: () => true } },
            { id: { type: String, validate: () => false } },
            {}
        ];
        const data = [
            { id: 'id' },
            { id: 'id' },
            { id: { id: 'id' } },
            { id: 'id' },
            { test: 'test' },
            { id: 'id' },
            { id: 'id' },
            {}
        ];
        let assertTypeStub, result;

        beforeEach(() => {
            assertTypeStub = sinon.stub().returns(true);

            schema = new Schema(schemas.shift());
            schema.assertType = assertTypeStub;

            result = schema.validate(data.shift());
        });

        it('should return true for default type assertion', () => {
            expect(result).to.be.true;

            expect(assertTypeStub.calledOnce).to.be.true;
        });

        it('should return true for type property definition', () => {
            expect(result).to.be.true;

            expect(assertTypeStub.calledOnce).to.be.true;
        });

        it('should return true for nested Schema definition', () => {
            expect(result).to.be.true;

            expect(assertTypeStub.calledOnce).to.be.true;
        });

        it('should return true for required value', () => {
            expect(result).to.be.true;

            expect(assertTypeStub.calledOnce).to.be.true;
        });

        it('should return false for required value', () => {
            expect(result).to.be.false;

            expect(assertTypeStub.called).to.be.false;
        });

        it('should return true for assigned custom validate function', () => {
            expect(result).to.be.true;

            expect(assertTypeStub.calledOnce).to.be.true;
        });

        it('should return false for assigned custom validate function', () => {
            expect(result).to.be.false;

            expect(assertTypeStub.calledOnce).to.be.true;
        });

        it('should return true for empty schema assignment', () => {
            expect(result).to.be.true;

            expect(assertTypeStub.called).to.be.false;
        });

        afterEach(() => {
            schema = null;
            result = null;
        });
    });

    describe('#assertType', () => {
        const testSchema = new Schema();
        const values = [ [], [], 'test', 0 ],
            assertListStubs = [
                sinon.stub().returns(true),
                sinon.stub().returns(false),
                sinon.stub().returns(true),
                sinon.stub().returns(true)
            ],
            types = [
                [testSchema],
                [testSchema],
                String,
                String
            ];
        let assertListStub, result;

        beforeEach(() => {
            assertListStub = assertListStubs.shift();

            schema = new Schema();
            schema.assertList = assertListStub;

            result = schema.assertType(values.shift(), types.shift());
        });

        it('should return true if Array assertion passed', () => {
            expect(result).to.be.a('boolean');
            expect(result).to.be.true;

            expect(assertListStub.calledOnce).to.be.true;
        });

        it('should return false if Array assertion failed', () => {
            expect(result).to.be.a('boolean');
            expect(result).to.be.false;

            expect(assertListStub.calledOnce).to.be.true;
        });

        it('should return true if type assertion passed', () => {
            expect(result).to.be.a('boolean');
            expect(result).to.be.true;

            expect(assertListStub.called).to.be.false;
        });

        it('should return false if type assertion failed', () => {
            expect(result).to.be.a('boolean');
            expect(result).to.be.false;

            expect(assertListStub.called).to.be.false;
        });

        afterEach(() => {
            schema = null;
            result = null;
            assertListStub = null;
        });
    });

    describe('#assertList', () => {
        const values = [ [], [{}], [{}, {}] ],
            validateStubs = [
                sinon.stub().returns(true),
                sinon.stub().returns(true),
                sinon.stub().onFirstCall().returns(true).onSecondCall().returns(false)
            ];
        let validateStub, result;

        beforeEach(() => {
            validateStub = validateStubs.shift();

            schema = new Schema();
            schema.validate = validateStub;

            result = schema.assertList(values.shift(), {});
        });

        it('should return true if list is empty', () => {
            expect(result).to.be.a('boolean');
            expect(result).to.be.true;

            expect(validateStub.called).to.be.false;
        });

        it('should assert values in a list successfully', () => {
            expect(result).to.be.a('boolean');
            expect(result).to.be.true;

            expect(validateStub.calledOnce).to.be.true;
        });

        it('should fail validation if an invalid value is found', () => {
            expect(result).to.be.a('boolean');
            expect(result).to.be.false;

            expect(validateStub.calledTwice).to.be.true;
        });

        afterEach(() => {
            schema = null;
            result = null;
            validateStub = null;
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
