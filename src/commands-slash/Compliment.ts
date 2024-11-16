import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction, User } from 'discord.js';

import {
    ComplimentType,
    friend,
    reason,
    type,
} from './options/compliment.js';

class Compliment extends BaseSlashCommand
{
    constructor()
    {
        super();
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addUserOption(friend)
            .addStringOption(reason)
            .addStringOption(type);
    }

    public async run(interaction: ChatInputCommandInteraction): Promise<void>
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

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    get description(): string
    {
        return `Compliment your friend.`;
    }
}

export default new Compliment();
