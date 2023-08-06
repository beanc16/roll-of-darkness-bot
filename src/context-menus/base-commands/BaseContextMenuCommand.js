/* eslint-disable no-unused-vars */
const { ApplicationCommandType, ContextMenuCommandBuilder } = require('discord.js');



class BaseContextMenuCommand
{
    _isInitialized;
    _commandData;

    constructor()
    {
        this._isInitialized = false;
        this._commandData = new ContextMenuCommandBuilder()
            .setName(this.commandName)
            .setType(ApplicationCommandType.Message)
            .setDefaultMemberPermissions(this.requiredPermissions);
    }

    async init()
    {
        this._isInitialized = true;
    }

    async run(bot, interaction)
    {
        throw new Error(`${this.commandName} has not yet been implemented!`);
    }



    get commandData()
    {
        return this._commandData;
    }
    
    get commandName()
    {
        return this.constructor.name.toLowerCase();
    }

    get requiredPermissions()
    {
        // eslint-disable-next-line getter-return
        return;
    }
}



module.exports = BaseContextMenuCommand;
