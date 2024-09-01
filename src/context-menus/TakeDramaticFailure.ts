import { Text } from '@beanc16/discordjs-helpers';
import { CacheType, Client, ClientUser, MessageContextMenuCommandInteraction } from 'discord.js';

import { BaseContextMenuCommand } from './base-commands/BaseContextMenuCommand.js';

class TakeDramaticFailure extends BaseContextMenuCommand
{
    async run(bot: Client, interaction: MessageContextMenuCommandInteraction<CacheType>)
    {
        const { user } = bot;
        const { id: botUserId } = user as ClientUser;

        const {
            targetMessage,
            targetMessage: {
                author: authorOfTargetMessage,
                content: targetMessageContent,
                mentions: {
                    users: usersPingedInTargetMessage,
                },
            },
            user: userOfCommmand,
        } = interaction;

        const {
            id: userIdOfCommandPingedInTargetMessage
        } = usersPingedInTargetMessage.get(userOfCommmand.id) || {};

        const numOfTimesOfCommandIsPinged = targetMessageContent.split(
            `${userIdOfCommandPingedInTargetMessage}`
        ).length - 1;


        // Send message to show the command was received
        await interaction.deferReply({
            ephemeral: true,
            fetchReply: true,
        });

        if (
            botUserId !== authorOfTargetMessage.id      // Only messages this bot made
            || !targetMessageContent.includes('rolled') // Only do roll commands
        )
        {
            await interaction.editReply(
                'This command can only be used on roll messages'
            );
            return;
        }
        // Only allow roll commands that the user of this command rolled
        else if (userOfCommmand.id !== userIdOfCommandPingedInTargetMessage)
        {
            await interaction.editReply(
                'This command can only be used on your own roll messages'
            );
            return;
        }
        // Only take a dramatic failure once
        else if (numOfTimesOfCommandIsPinged > 1)
        {
            await interaction.editReply(
                'You can only take a dramatic failure for a beat once, ya greedy bastard'
            );
            return;
        }

        // TODO: Calculate the number of beats you get based on successes.

        const targetMessageContentWithoutStrikethrough = targetMessageContent.replaceAll('~', '');
        const userPing = Text.Ping.user(userIdOfCommandPingedInTargetMessage);

        await interaction.deleteReply();
        await targetMessage.edit(
            `~~${targetMessageContentWithoutStrikethrough}~~\n\n${userPing} took a dramatic failure for a beat 😈`
        );
        await targetMessage.reply(
            `${userPing} took a dramatic failure for a beat 😈`
        );
    }

    get description()
    {
        return `Turn a roll into a dramatic failure.`;
    }
}



export default new TakeDramaticFailure();
