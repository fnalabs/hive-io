import { Command } from 'js-cqrs-es';

export class CreateContent extends Command {
    constructor(data) {
        super(data);
        this.content = data.content;
    }
}

export class ModifyContent extends Command {
    constructor(data) {
        super(data);
        this.content = data.content;
        this.postId = { id: data.postId.id };
    }
}

export class EnableContent extends Command {
    constructor(data) {
        super(data);
        this.postId = { id: data.postId.id };
    }
}

export class DisableContent extends Command {
    constructor(data) {
        super(data);
        this.postId = { id: data.postId.id };
    }
}
