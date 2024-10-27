import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    Message,
} from 'discord.js';
import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { Text } from '@beanc16/discordjs-helpers';
import { logger } from '@beanc16/logger';

import {
    name,
    type,
} from './options/counter.js';

enum ButtonName {
    Plus = 'plus',
    Minus = 'minus',
}

class Counter extends BaseSlashCommand
{
    private count: number;

    constructor()
    {
        super();
        this._slashCommandData
            .addStringOption(name)
            .addStringOption(type);

        this.count = 0;
    }

    public async run(interaction: ChatInputCommandInteraction)
    {
        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const name = interaction.options.getString('name', true);
        // const type = interaction.options.getString('type') ?? CounterType.Temporary;

        // Send message
        const response = await interaction.editReply(
            this.getMessageData(name)
        );

        // Handle button interactions
        this.handleButtonInteractions({
            originalInteraction: interaction,
            interactionResponse: response,
            name,
        });
    }

    get description()
    {
        return `Add a basic counter for adding/subtracting numbers.`;
    }

    private getMessageData(name: string)
    {
        const message = `${Text.bold(`${name}:`)} ${this.count}`;
        const buttonRow = this.getButtonRowComponent();

        return {
            content: message,
            components: [buttonRow],
        };
    }

    private getButtonRowComponent(): ActionRowBuilder<ButtonBuilder>
    {
        const plusButton = new ButtonBuilder()
            .setCustomId(ButtonName.Plus)
            .setEmoji('➕')
            .setStyle(ButtonStyle.Success);

        const minusButton = new ButtonBuilder()
            .setCustomId(ButtonName.Minus)
            .setEmoji('➖')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                plusButton,
                minusButton,
            );

        return row;
    }

    private async handleButtonInteractions({
        originalInteraction,
        interactionResponse,
        name,
    }: {
        originalInteraction: ChatInputCommandInteraction;
        interactionResponse: Message<boolean>;
        name: string;
    })
    {
        try
        {
            const buttonInteraction = await interactionResponse.awaitMessageComponent({
                componentType: ComponentType.Button,
            });

            this.updateCount(buttonInteraction);
            await buttonInteraction.update(
                this.getMessageData(name)
            );

            interactionResponse = buttonInteraction.message;
        }
        catch (error)
        {
            // Ignore timeouts
            if ((error as Error).message !== 'Collector received no interactions before ending with reason: time')
            {
                logger.error('An unknown error occurred whilst collecting pages', error);
            }
        }
        finally
        {
            // Restart listener upon timeout
            this.handleButtonInteractions({
                name,
                originalInteraction,
                interactionResponse,
            });
        }
    }

    private updateCount(buttonInteraction: ButtonInteraction)
    {
        const handlerMap: Record<ButtonName, () => number> = {
            [ButtonName.Plus]: () => this.count += 1,
            [ButtonName.Minus]: () => this.count -= 1,
        };

        return handlerMap[buttonInteraction.customId as ButtonName]();
    }
}



export default new Counter();
