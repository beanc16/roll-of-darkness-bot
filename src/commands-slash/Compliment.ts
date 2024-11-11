import { ChatInputCommandInteraction, User } from 'discord.js';

import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { Text } from '@beanc16/discordjs-helpers';
import { ComplimentType, friend, reason, type } from './options/compliment.js';

class Compliment extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addUserOption(friend)
            .addStringOption(reason)
            .addStringOption(type);
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
        const type = interaction.options.getString('type') as ComplimentType ?? ComplimentType.Beat;

        const message = this.getMessage({
            interaction,
            friend,
            type,
            unparsedReason,
        });

        await interaction.editReply(message);
    }

    getMessage({
        interaction,
        friend,
        type,
        unparsedReason,
    }: {
        interaction: ChatInputCommandInteraction;
        friend: User;
        unparsedReason: string | null;
        type: ComplimentType;
    })
    {
        const reason = (unparsedReason)
            ? `\n> ${unparsedReason}`
            : '';

        const complimentText = (type === ComplimentType.Beat)
            ? 'beat up'
            : 'complimented';

        return `${Text.Ping.user(interaction.user.id)} ${complimentText} `
            + `${Text.Ping.user(friend.id)} ${this.getEmoji(type)}${reason}`;
    }

    getEmoji(type: ComplimentType)
    {
        if (type === ComplimentType.Beat)
        {
            return '<:beet:1170454391451553872>';
        }

        return '❤️'; // Red heart
    }

    get description()
    {
        return `Compliment your friend.`;
    }
}



export default new Compliment();
