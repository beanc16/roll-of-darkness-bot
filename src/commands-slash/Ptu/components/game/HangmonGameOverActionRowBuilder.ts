import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum HangmonGameOverCustomIds
{
    PlayAgain = 'Play Again',
}

export class HangmonGameOverActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        super({
            components: [
                new ButtonBuilder({
                    customId: HangmonGameOverCustomIds.PlayAgain,
                    label: 'Play Again',
                    emoji: '🔄',
                    style: ButtonStyle.Secondary,
                }),
                // TODO: Include button that replies with a fully featured version of looking up that pokemon by name
            ],
        });
    }
}
