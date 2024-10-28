import { ChatInputCommandInteraction } from 'discord.js';

import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { Text } from '@beanc16/discordjs-helpers';
import * as options from './options/index.js';

// TODO: Move to nwod
class Beat extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addUserOption(options.beat.friend)
            .addStringOption(options.beat.reason);
    }

    async run(interaction: ChatInputCommandInteraction)
    {
        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const friend = interaction.options.getUser('friend', true);
        const unparsedReason = interaction.options.getString('reason');

        const reason = (unparsedReason)
            ? `\n> ${unparsedReason}`
            : '';

        await interaction.editReply(
            `${Text.Ping.user(interaction.user.id)} beat up ${Text.Ping.user(friend.id)} <:beet:1170454391451553872>${reason}`
        );
    }

    get description()
    {
        return `Beat up your friend.`;
    }
}



export default new Beat();
