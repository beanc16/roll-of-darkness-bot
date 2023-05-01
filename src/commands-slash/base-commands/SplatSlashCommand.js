const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const options = require('../options');

class SplatSlashCommand extends BaseSlashCommand
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



module.exports = SplatSlashCommand;
