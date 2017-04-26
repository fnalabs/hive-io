import { Handler } from 'js-cqrs-es';

import * as events from './events';
import * as commands from './commands';

// extends Handler to inject the IDs generated from a new Aggregate
class CreateHandler extends Handler {
    handle(data, aggregate) {
        data.id = aggregate.id;
        data.postId = { id: aggregate.postId.id };
        data.sequence = 1;

        return super.handle(data, aggregate);
    }
}


export const CreateContent = new CreateHandler(commands.CreateContent, events.CreatedContent);
export const ModifyContent = new Handler(commands.ModifyContent, events.ModifiedContent);
export const EnableContent = new Handler(commands.EnableContent, events.EnabledContent);
export const DisableContent = new Handler(commands.DisableContent, events.DisabledContent);
