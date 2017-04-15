import { expect } from 'chai';

import Message from '../../src/js/Message';

describe('Message class', () => {
    let message;

    describe('#constructor', () => {
        before(() => {
            message = new Message({ id: 'id', sequence: 0 });
        });

        it('should create a Message object successfully', () => {
            expect(message).to.exist;

            expect(message.toJSON).to.be.a('function');

            expect(message.id).to.be.a('string');
            expect(message.id).to.equal('id');

            expect(message.sequence).to.be.a('number');
            expect(message.sequence).to.equal(0);
        });

        after(() => {
            message = null;
        });
    });

    describe('#toJSON', () => {
        const expectedResult = { id: 'id', sequence: 0, name: 'Message' };

        before(() => {
            message = new Message({ id: 'id', sequence: 0 });
        });

        it('should add Message name to JSON string', () => {
            expect(message.toJSON()).to.be.an('object');
            expect(message.toJSON()).to.deep.equal(expectedResult);

            expect(JSON.stringify(message)).to.be.an('string');
            expect(JSON.parse(JSON.stringify(message))).to.deep.equal(expectedResult);
        });

        after(() => {
            message = null;
        });
    });

});
