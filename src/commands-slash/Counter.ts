import { randomUUID, UUID } from 'node:crypto';
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
import counterSingleton from './Counter/models/CounterSingleton.js';

enum ButtonName
{
    Plus = 'plus',
    Minus = 'minus',
}

class Counter extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addStringOption(name)
            .addStringOption(type);
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

        // Setup variables
        const guid = randomUUID();

        // Send message
        const response = await interaction.editReply(
            this.getMessageData(name, guid)
        );
        this.initializeCounter({
            guid,
            interaction,
            response,
        });

        // Handle button interactions
        this.handleButtonInteractions({
            originalInteraction: interaction,
            interactionResponse: response,
            name,
            guid,
        });
    }

    get description()
    {
        return `Add a basic counter for adding/subtracting numbers.`;
    }

    private initializeCounter({
        guid,
        interaction,
        response,
    }: {
        guid: UUID;
        interaction: ChatInputCommandInteraction;
        response: Message;
    })
    {
        counterSingleton.upsert({
            guid,
            count: 0,
            auditLogs: [],
            discordCreator: {
                userId: interaction.user.id,
                serverId: interaction.guildId ?? interaction.channelId,
                messageId: response.id,
            },
        });
    }

    private getMessageData(name: string, guid: UUID)
    {
        const message = `${Text.bold(`${name}:`)} ${counterSingleton.get(guid)?.count ?? 0}`;
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
        guid,
    }: {
        originalInteraction: ChatInputCommandInteraction;
        interactionResponse: Message<boolean>;
        name: string;
        guid: UUID;
    })
    {
        let buttonInteraction: ButtonInteraction | undefined;

        try
        {
            // Wait for button interactions
            buttonInteraction = await interactionResponse.awaitMessageComponent({
                componentType: ComponentType.Button,
            });

            // Update count based on interaction
            this.updateCount(buttonInteraction, guid);
            await buttonInteraction.update(
                this.getMessageData(name, guid)
            );
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
                interactionResponse: buttonInteraction?.message ?? interactionResponse,
                guid,
            });
        }
    }

    private updateCount(buttonInteraction: ButtonInteraction, guid: UUID)
    {
        const handlerMap: Record<ButtonName, () => void> = {
            [ButtonName.Plus]: () => counterSingleton.incrementCount(
                guid,
                buttonInteraction.user.id
            ),
            [ButtonName.Minus]: () => counterSingleton.decrementCount(
                guid,
                buttonInteraction.user.id
            ),
        };

        return handlerMap[buttonInteraction.customId as ButtonName]();
    }
}



export default new Counter();
