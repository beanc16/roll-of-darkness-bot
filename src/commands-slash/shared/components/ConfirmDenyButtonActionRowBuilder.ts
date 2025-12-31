import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum ConfirmDenyButtonCustomIds
{
    Confirm = '✅ Confirm',
    Deny = '❌ Deny',
}

export class ConfirmDenyButtonActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        const confirmButton = new ButtonBuilder({
            customId: ConfirmDenyButtonCustomIds.Confirm,
            label: ConfirmDenyButtonCustomIds.Confirm,
            style: ButtonStyle.Secondary,
        });

        const denyButton = new ButtonBuilder({
            customId: ConfirmDenyButtonCustomIds.Deny,
            label: ConfirmDenyButtonCustomIds.Deny,
            style: ButtonStyle.Secondary,
        });

        super({
            components: [
                confirmButton,
                denyButton,
            ],
        });
    }
}
