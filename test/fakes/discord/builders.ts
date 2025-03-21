/* eslint-disable max-classes-per-file */

import {
    ActionRowBuilder,
    type APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    type EmbedData,
    StringSelectMenuBuilder,
} from 'discord.js';

export const getFakeButtonActionRowBuilder = ({
    customId = 'fake-button',
    label = 'fake-label',
    emoji = '😀',
    style = ButtonStyle.Secondary,
    isDisabled = false,
}: {
    customId?: string;
    label?: string;
    emoji?: string;
    style?: ButtonStyle;
    isDisabled?: boolean;
} = {}): ActionRowBuilder<ButtonBuilder> =>
{
    const button = new ButtonBuilder({
        customId,
        disabled: isDisabled,
        emoji,
        label,
    })
        .setStyle(style);

    const row = new ActionRowBuilder<ButtonBuilder>({
        components: [button],
    });

    return row;
};

export const getFakeStringSelectMenuActionRowBuilder = ({
    customId = 'fake-button',
    isDisabled = false,
    label = 'fake-label',
    description = 'fake-description',
    value = 'fake-value',
    emoji = '😀',
}: {
    customId?: string;
    isDisabled?: boolean;
    label?: string;
    description?: string;
    value?: string;
    emoji?: string;
} = {}): ActionRowBuilder<StringSelectMenuBuilder> =>
{
    const stringSelectMenu = new StringSelectMenuBuilder({
        customId,
        disabled: isDisabled,
        options: [
            {
                label,
                description,
                value,
                emoji,
            },
        ],
    });

    const row = new ActionRowBuilder<StringSelectMenuBuilder>({
        components: [stringSelectMenu],
    });

    return row;
};

export class FakeEmbedBuilder extends EmbedBuilder
{
    constructor(data?: EmbedData | APIEmbed)
    {
        super({ ...data });
    }
}
