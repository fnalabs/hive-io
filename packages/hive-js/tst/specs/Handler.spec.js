import { expect } from 'chai';
import sinon from 'sinon';

import Handler from '../../src/js/Handler';
import Command from '../../src/js/Command';
import Event from '../../src/js/Event';

describe('Handler class', () => {
    let handler;

    describe('#constructor', () => {
        before(() => {
            handler = new Handler(Command, Event);
        });

        it('should create a Handler object successfully', () => {
            expect(handler).to.exist;

            expect(handler.handle).to.be.a('function');
            expect(handler.execute).to.be.a('function');
        });

        after(() => {
            handler = null;
        });
    });

    describe('#handle', () => {
        let executeSpy, result;
        const aggregateValidationResults = [true, false, true],
            commandValidationResults = [true, true, false];

        beforeEach(() => {
            executeSpy = sinon.stub().returns(true);
            Command.prototype.validate = sinon.stub().returns(commandValidationResults.shift());

            handler = new Handler(Command, Event);
            handler.execute = executeSpy;

            result = handler.handle({ id: 'id', sequence: 0 }, { validate: sinon.stub().returns(aggregateValidationResults.shift()) });
        });

        it('should handle the command data successfully', () => {
            expect(result).to.be.a('boolean');
            expect(result).to.be.true;

            expect(executeSpy.calledOnce).to.be.true;
        });

        it('should return an undefined event if aggregate validation fails', () => {
            expect(result).to.be.undefined;
            expect(executeSpy.called).to.be.false;
        });

        it('should return an undefined event if command validation fails', () => {
            expect(result).to.be.undefined;
            expect(executeSpy.called).to.be.false;
        });

        afterEach(() => {
            handler = null;
        });
    });

    describe('#execute', () => {
        let result;

        beforeEach(() => {
            handler = new Handler(Command, Event);

            result = handler.execute(new Command({ id: 'id', sequence: 0 }));
        });

        it('should handle the command data successfully', () => {
            expect(result).to.be.an('object');

            expect(result.id).to.be.a('string');
            expect(result.id).to.equal('id');

            expect(result.sequence).to.be.a('number');
            expect(result.sequence).to.equal(0);

            expect(result.timestamp).to.be.a('string');
            expect(Date.parse(result.timestamp)).to.be.a('number');
        });

        after(() => {
            handler = null;
        });
    });

});
