import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction, User } from 'discord.js';

import {
    ComplimentType,
    friend as friendOption,
    reason as reasonOption,
    type as typeOption,
} from './options/compliment.js';

class Compliment extends BaseSlashCommand
{
    constructor()
    {
        super();
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addUserOption(friendOption)
            .addStringOption(reasonOption)
            .addStringOption(typeOption);
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
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

        const message = Compliment.getMessage({
            interaction,
            friend,
            type,
            unparsedReason,
        });

        await interaction.editReply(message);
    }

    private static getMessage({
        interaction,
        friend,
        type,
        unparsedReason,
    }: {
        interaction: ChatInputCommandInteraction;
        friend: User;
        unparsedReason: string | null;
        type: ComplimentType;
    }): string
    {
        const reason = (unparsedReason)
            ? `\n> ${unparsedReason}`
            : '';

        const complimentText = (type === ComplimentType.Beat)
            ? 'beat up'
            : 'complimented';

        return `${Text.Ping.user(interaction.user.id)} ${complimentText} `
            + `${Text.Ping.user(friend.id)} ${Compliment.getEmoji(type)}${reason}`;
    }

    private static getEmoji(type: ComplimentType): string
    {
        if (type === ComplimentType.Beat)
        {
            return Text.emoji({
                emojiId: '1170454391451553872',
                emojiName: 'beet',
                isAnimated: false,
            });
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
