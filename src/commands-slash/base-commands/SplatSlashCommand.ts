import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import * as options from '../Nwod/options/roll.js';

export default class SplatSlashCommand extends BaseSlashCommand
{
    async init()
    {
        if (!this._isInitialized)
        {
            this._slashCommandData
                .addStringOption(options.splat);
            await super.init();
        }
    }
}
