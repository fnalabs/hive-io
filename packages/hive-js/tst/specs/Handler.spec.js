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
        });

        after(() => {
            handler = null;
        });
    });

    describe('#handle', () => {
        let applyDataSpy, result;

        before(() => {
            applyDataSpy = sinon.stub().returns(true);

            handler = new Handler(Command, Event);

            result = handler.handle({ id: 'id', sequence: 0 }, { applyData: applyDataSpy });
        });

        it('should handle the command data successfully', () => {

            expect(result).to.be.an.instanceof(Event);

            expect(result.id).to.be.a('string');
            expect(result.id).to.equal('id');

            expect(result.sequence).to.be.a('number');
            expect(result.sequence).to.equal(0);

            expect(result.timestamp).to.be.a('string');
            expect(Date.parse(result.timestamp)).to.be.a('number');

            expect(applyDataSpy.calledOnce).to.be.true;
        });

        after(() => {
            handler = null;
        });
    });

});
