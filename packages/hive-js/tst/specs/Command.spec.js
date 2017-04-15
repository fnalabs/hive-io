import proxyquire from 'proxyquire';
import { expect } from 'chai';
import sinon from 'sinon';

describe('Command class', () => {
    let Command, command;

    describe('#constructor', () => {
        let constructorSpy;

        before(() => {
            constructorSpy = sinon.spy();
            Command = proxyquire('../../src/js/Command', {
                './Message': class Message {
                    constructor() {
                        constructorSpy();
                    }
                }
            });

            command = new Command();
        });

        it('should create a Command object successfully', () => {
            expect(command).to.exist;

            expect(command.validate).to.be.a('function');

            expect(constructorSpy.calledOnce).to.be.true;
        });

        after(() => {
            Command = null;
            command = null;
        });
    });

    describe('#validate', () => {
        let result;

        before(() => {
            Command = proxyquire('../../src/js/Command', {
                './Message': class Message {
                    constructor() {}
                }
            });

            command = new Command();

            result = command.validate();
        });

        it('should return true by default if no validations have overridden default behavior', () => {
            expect(result).to.be.true;
        });

        after(() => {
            Command = null;
            command = null;
        });
    });

});
