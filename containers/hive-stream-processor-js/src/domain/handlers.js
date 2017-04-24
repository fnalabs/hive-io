import CONFIG from '../config/appConfig';

import { Handler } from 'js-cqrs-es';

import * as events from './events';

const commands = require(CONFIG.COMMAND_LIB);


export const CreateContent = new Handler(commands.CreateContent, events.CreatedContent);
export const ModifyContent = new Handler(commands.ModifyContent, events.ModifiedContent);
export const EnableContent = new Handler(commands.EnableContent, events.EnabledContent);
export const DisableContent = new Handler(commands.DisableContent, events.DisabledContent);
