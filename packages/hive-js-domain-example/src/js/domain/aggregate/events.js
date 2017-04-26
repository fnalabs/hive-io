import { Event } from 'js-cqrs-es';

export class CreatedContent extends Event {
    constructor(data) {
        super(data);
        this.content = data.content;
        this.postId = { id: data.postId.id };
    }
}

export class ModifiedContent extends Event {
    constructor(data) {
        super(data);
        this.content = data.content;
        this.postId = { id: data.postId.id };
    }
}

export class EnabledContent extends Event {
    constructor(data) {
        super(data);
        this.postId = { id: data.postId.id };
    }
}

export class DisabledContent extends Event {
    constructor(data) {
        super(data);
        this.postId = { id: data.postId.id };
    }
}
