import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    InteractionType,
    StringSelectMenuInteraction,
} from 'discord.js';

import { InteractionReplyType } from '../../types/discord.js';

// bind is necessary for all of the below, otherwise the returned
// function will not have the correct context of "this" in the
// consumer, and will throw an error
/* eslint-disable @typescript-eslint/explicit-function-return-type -- Allow this to inferred */
export function getInteractionHandler(
    interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
    interactionReplyType: InteractionReplyType,
)
{
    switch (interactionReplyType)
    {
        case InteractionReplyType.FollowUp:
            return interaction.followUp.bind(interaction);

        case InteractionReplyType.EditReply:
            return interaction.editReply.bind(interaction);

        case InteractionReplyType.Update:
            if (interaction.type === InteractionType.ApplicationCommand)
            {
                throw new Error('Cannot update application commands');
            }
            return interaction.update.bind(interaction);

        case InteractionReplyType.ChannelSend:
            if (!interaction.channel)
            {
                throw new Error('Interaction is not in a channel');
            }
            return interaction.channel.send.bind(interaction.channel);

        default:
            throw new Error('Invalid interactionReplyType');
    }
}
