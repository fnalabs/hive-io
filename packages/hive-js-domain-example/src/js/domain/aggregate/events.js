import { Event } from 'js-cqrs-es';

export class CreatedContent extends Event {
    constructor(data) {
        super(data);
        this.id = { id: data.id.id };
        this.content = data.content;
    }
}

export class ModifiedContent extends Event {
    constructor(data) {
        super(data);
        this.id = { id: data.id.id };
        this.content = data.content;
    }
}

export class EnabledContent extends Event {
    constructor(data) {
        super(data);
        this.id = { id: data.id.id };
    }
}

export class DisabledContent extends Event {
    constructor(data) {
        super(data);
        this.id = { id: data.id.id };
    }
}
