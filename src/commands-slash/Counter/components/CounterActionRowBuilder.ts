import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

export enum CounterButtonName
{
    Plus = 'plus',
    Minus = 'minus',
    AuditLog = 'audit_log',
}

export class CounterActionRowBuilder extends ActionRowBuilder<ButtonBuilder>
{
    constructor()
    {
        const plusButton = new ButtonBuilder({
            customId: CounterButtonName.Plus,
            emoji: '➕',
            style: ButtonStyle.Success,
        });

        const minusButton = new ButtonBuilder({
            customId: CounterButtonName.Minus,
            emoji: '➖',
            style: ButtonStyle.Danger,
        });

        const auditLogButton = new ButtonBuilder({
            customId: CounterButtonName.AuditLog,
            emoji: '📋',
            style: ButtonStyle.Secondary,
        });

        super({
            components: [plusButton, auditLogButton, minusButton],
        });
    }
}
