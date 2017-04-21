import { expect } from 'chai';

import Command from '../../src/js/Command';

describe('Command class', () => {
    let command;

    describe('#constructor', () => {
        it('should create a Command object successfully', () => {
            command = new Command({ id: 'id', sequence: 1 });

            expect(command).to.exist;

            expect(command.validate).to.be.a('function');

            expect(command.id).to.be.a('string');
            expect(command.id).to.equal('id');

            expect(command.sequence).to.be.a('number');
            expect(command.sequence).to.equal(1);
        });

        it('should throw a type error with undefined data', () => {
            expect(() => new Command()).to.throw(TypeError);
        });

        afterEach(() => {
            command = null;
        });
    });

    describe('#validate', () => {
        before(() => {
            command = new Command({ id: 'id', sequence: 1 });
        });

        it('should not error by default if no validations have overridden default behavior', () => {
            expect(command.validate).to.not.throw(Error);
        });

        after(() => {
            command = null;
        });
    });

});
