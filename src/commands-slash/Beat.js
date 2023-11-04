const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const { Text } = require('@beanc16/discordjs-helpers');
const options = require('./options');

class Beat extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addUserOption(options.beat.friend);
    }

    async run(interaction)
    {
        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const friend = interaction.options.getUser('friend');

        await interaction.editReply(
            `${Text.Ping.user(interaction.user.id)} beat up ${Text.Ping.user(friend.id)} <:beet:1170454391451553872>`
        );
    }

    get description()
    {
        return `Beat up your friend.`;
    }
}



module.exports = new Beat();
