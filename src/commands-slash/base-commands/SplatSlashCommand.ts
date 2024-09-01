import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import * as options from '../options/index.js';

export default class SplatSlashCommand extends BaseSlashCommand
{
    async init()
    {
        if (!this._isInitialized)
        {
            this._slashCommandData
                .addStringOption(options.roll.splat);
            await super.init();
        }
    }
}
