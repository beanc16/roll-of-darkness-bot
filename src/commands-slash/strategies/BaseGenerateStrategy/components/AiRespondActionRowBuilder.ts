import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum AiButtonName
{
    Respond = 'Respond',
}

export class AiRespondActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        // TODO: Add button to display the user's prompt for the current response
        const respondButton = new ButtonBuilder({
            customId: AiButtonName.Respond,
            label: AiButtonName.Respond,
            emoji: '🗨️',
            style: ButtonStyle.Secondary,
        });

        super({
            components: [respondButton],
        });
    }
}
