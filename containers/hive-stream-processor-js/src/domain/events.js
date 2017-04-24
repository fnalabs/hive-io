import { Event } from 'js-cqrs-es';

export class CreatedContent extends Event {
    constructor(data) {
        super(data);
        if (data.content) this.content;
    }
}

export class ModifiedContent extends Event {
    constructor(data) {
        super(data);
        this.content = data.content;
    }
}

export class EnabledContent extends Event {}

export class DisabledContent extends Event {}
