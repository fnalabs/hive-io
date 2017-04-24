import uuidV4 from 'uuid/v4';
import { Command } from 'js-cqrs-es';

export class CreateContent extends Command {
    constructor(data = { id: uuidV4(), sequence: 1 }) {
        super(data);

        // ensure Create command is always the first in the sequence
        data.sequence = 1;

        // if initial data is provided, pass that along too
        if (data.content) this.content;
    }
}

export class ModifyContent extends Command {
    constructor(data) {
        super(data);
        this.content = data.content;
    }
}

export class EnableContent extends Command {}

export class DisableContent extends Command {}
