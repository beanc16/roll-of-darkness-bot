import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
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
    const button = new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setEmoji(emoji)
        .setStyle(style)
        .setDisabled(isDisabled);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(button);

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
    const stringSelectMenu = new StringSelectMenuBuilder()
        .setCustomId(customId)
        .setDisabled(isDisabled)
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(label)
                .setDescription(description)
                .setValue(value)
                .setEmoji(emoji),
        );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(stringSelectMenu);

    return row;
};
