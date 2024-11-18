import { randomUUID, UUID } from 'node:crypto';

import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { Text } from '@beanc16/discordjs-helpers';
import { logger } from '@beanc16/logger';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    Client,
    ComponentType,
    Message,
    MessageInteraction,
    TextChannel,
} from 'discord.js';

import { CounterController } from './Counter/dal/CounterMongoController.js';
import { Counter as CounterForDb } from './Counter/dal/models/Counter.js';
import { CounterContainer } from './Counter/dal/models/CounterContainer.js';
import counterSingleton from './Counter/services/CounterSingleton.js';
import { upsertCounterCountainerWithDbUpdate } from './Counter/services/upsertCounterCountainer.js';
import { getPagedEmbedBuilders } from './embed-messages/shared.js';
import * as options from './options/counter.js';
import { PaginationStrategy } from './strategies/PaginationStrategy.js';

enum CounterButtonName
{
    Plus = 'plus',
    Minus = 'minus',
    AuditLog = 'audit_log',
}

class Counter extends BaseSlashCommand
{
    constructor()
    {
        super();
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addStringOption(options.name)
            .addStringOption(options.type);
    }

    public async run(interaction: ChatInputCommandInteraction): Promise<void>
    {
        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const name = interaction.options.getString('name', true);
        const type = interaction.options.getString('type') as options.CounterType ?? options.CounterType.Temporary;

        // Setup variables
        const guid = randomUUID();

        // Send message
        const response = await interaction.editReply(
            Counter.getMessageData(name, guid),
        );
        Counter.initializeCounter({
            guid,
            name,
            interaction,
            response,
            type,
        });

        // Handle button interactions
        this.handleButtonInteractions({
            originalInteraction: interaction,
            interactionResponse: response,
            name,
            guid,
            type,
        });
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    get description(): string
    {
        return `Add a basic counter for adding/subtracting numbers.`;
    }

    private static initializeCounter({
        guid,
        name,
        interaction,
        response,
        type,
    }: {
        guid: UUID;
        name: string;
        interaction: ChatInputCommandInteraction;
        response: Message;
        type: options.CounterType;
    }): void
    {
        upsertCounterCountainerWithDbUpdate(new CounterContainer(
            {
                guid,
                name,
                count: 0,
                auditLogs: [],
                discordCreator: {
                    userId: interaction.user.id,
                    ...(interaction.guildId
                        ? { serverId: interaction.guildId }
                        : {}
                    ),
                    channelId: interaction.channelId,
                    messageId: response.id,
                },
            },
            type,
        ));
    }

    private static getMessageData(name: string, guid: UUID): {
        content: string;
        components: ActionRowBuilder<ButtonBuilder>[];
    }
    {
        const message = `${Text.bold(`${name}:`)} ${counterSingleton.get(guid)?.count ?? 0}`;
        const buttonRow = Counter.getButtonRowComponent();

        return {
            content: message,
            components: [buttonRow],
        };
    }

    private static getButtonRowComponent(): ActionRowBuilder<ButtonBuilder>
    {
        const plusButton = new ButtonBuilder()
            .setCustomId(CounterButtonName.Plus)
            .setEmoji('➕')
            .setStyle(ButtonStyle.Success);

        const minusButton = new ButtonBuilder()
            .setCustomId(CounterButtonName.Minus)
            .setEmoji('➖')
            .setStyle(ButtonStyle.Danger);

        const auditLogButton = new ButtonBuilder()
            .setCustomId(CounterButtonName.AuditLog)
            .setEmoji('📋')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                plusButton,
                auditLogButton,
                minusButton,
            );

        return row;
    }

    private async handleButtonInteractions({
        originalInteraction,
        interactionResponse,
        name,
        guid,
        type,
    }: {
        originalInteraction: ChatInputCommandInteraction | MessageInteraction;
        interactionResponse: Message<boolean>;
        name: string;
        guid: UUID;
        type: options.CounterType;
    }): Promise<void>
    {
        let buttonInteraction: ButtonInteraction | undefined;

        try
        {
            // Wait for button interactions
            buttonInteraction = await interactionResponse.awaitMessageComponent({
                componentType: ComponentType.Button,
            });

            // Update count based on interaction
            Counter.updateCount(buttonInteraction, guid);
            await buttonInteraction.update(
                Counter.getMessageData(name, guid),
            );
        }
        catch (error)
        {
            // Ignore timeouts
            if ((error as Error).message !== 'Collector received no interactions before ending with reason: time')
            {
                logger.error('An unknown error occurred whilst handling Counter button interactions', error);
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
                type,
            });
        }
    }

    private static updateCount(buttonInteraction: ButtonInteraction, guid: UUID): void
    {
        const handlerMap: Record<CounterButtonName, () => void> = {
            [CounterButtonName.Plus]: () =>
            {
                counterSingleton.incrementCount({
                    guid,
                    userId: buttonInteraction.user.id,
                });
                upsertCounterCountainerWithDbUpdate(guid);
            },
            [CounterButtonName.Minus]: () =>
            {
                counterSingleton.decrementCount({
                    guid,
                    userId: buttonInteraction.user.id,
                });
                upsertCounterCountainerWithDbUpdate(guid);
            },
            [CounterButtonName.AuditLog]: () => Counter.getAuditLogMessage(guid, buttonInteraction),
        };

        return handlerMap[buttonInteraction.customId as CounterButtonName]();
    }

    private static getAuditLogMessage(guid: UUID, buttonInteraction: ButtonInteraction): void
    {
        const { auditLogs = [] } = counterSingleton.get(guid).getCounter();

        const { pages } = auditLogs.reduce<{
            pages: string[];
            curPageIndex: number;
        }>((acc, { userId, operation }, index) =>
        {
            // Add a new page if the page goes over the max limit
            if (acc.pages[acc.curPageIndex] && (index + 1) % 20 === 0)
            {
                acc.curPageIndex += 1;
            }

            // Initialize empty page
            if (!acc.pages[acc.curPageIndex])
            {
                acc.pages.push('');
            }

            acc.pages[acc.curPageIndex] += `${Text.Ping.user(userId)} ${operation}\n`;

            return acc;
        }, {
            pages: [],
            curPageIndex: 0,
        });

        const embeds = getPagedEmbedBuilders({
            title: 'Audit Log',
            pages,
            url: buttonInteraction.message.url,
        });

        // Send messages with pagination (fire and forget)
        PaginationStrategy.run({
            originalInteraction: buttonInteraction,
            interactionType: 'dm',
            embeds,
        });
    }

    public async runOnStartup(bot: Client): Promise<void>
    {
        try
        {
            logger.debug('Initializing counters...');

            const { results = [] } = await CounterController.getAll({}) as {
                results: CounterForDb[];
            };

            const promises = results.map(async (counter) =>
            {
                const {
                    discordCreator: { channelId, messageId },
                } = counter;

                // Get the message that the counter belongs to
                const channel = await bot.channels.fetch(channelId) as TextChannel;
                const message = await channel.messages.fetch(messageId);

                // Overwrite the count from the database with whatever's in the message
                const count = Counter.getCount(message);
                const newCounter = { ...counter, count };

                // Only update messages owned by the bot
                if (message.author.id === bot.user?.id)
                {
                    // Save the counter to the cache
                    counterSingleton.upsert(
                        new CounterContainer(newCounter, options.CounterType.Permanent, true),
                    );

                    // Add buttons to the message for counter
                    await message.edit(
                        Counter.getMessageData(newCounter.name, newCounter.guid),
                    );

                    // Listen for button interactions
                    this.handleButtonInteractions({
                        originalInteraction: message.interaction as MessageInteraction,
                        interactionResponse: message,
                        name: newCounter.name,
                        guid: newCounter.guid,
                        type: options.CounterType.Permanent,
                    });
                }
            });

            await Promise.all(promises);

            logger.debug('Counters intialized!');
        }
        catch (error)
        {
            logger.error('An error occurred while initializing pre-existing counters', error);
        }
    }

    private static getCount(message: Message): number
    {
        const indexOfAfterColon = message.content.indexOf(':') + 1;
        const countStr = message.content.slice(indexOfAfterColon).trim().replaceAll('*', '');
        return parseInt(countStr, 10);
    }
}

export default new Counter();
