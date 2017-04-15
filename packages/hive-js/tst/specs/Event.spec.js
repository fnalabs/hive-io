import proxyquire from 'proxyquire';
import { expect } from 'chai';
import sinon from 'sinon';

describe('Event class', () => {
    let Event, event;

    describe('#constructor', () => {
        let constructorSpy;

        before(() => {
            constructorSpy = sinon.spy();
            Event = proxyquire('../../src/js/Event', {
                './Message': class Message {
                    constructor() {
                        constructorSpy();
                    }
                }
            });

            event = new Event();
        });

        it('should create a Event object successfully', () => {
            expect(event).to.exist;

            expect(event.timestamp).to.be.a('string');
            expect(Date.parse(event.timestamp)).to.be.a('number');

            expect(constructorSpy.calledOnce).to.be.true;
        });

        after(() => {
            Event = null;
            event = null;
        });
    });

});
