import { randomUUID, UUID } from 'node:crypto';
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
import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { Text } from '@beanc16/discordjs-helpers';
import { logger } from '@beanc16/logger';

import {
    CounterType,
    name,
    type,
} from './options/counter.js';
import counterSingleton from './Counter/models/CounterSingleton.js';
import {
    Counter as CounterForDb,
    CounterContainer,
    CounterController,
} from './Counter/dal/CounterMongoController.js';

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
        const type = interaction.options.getString('type') as CounterType ?? CounterType.Temporary;

        // Setup variables
        const guid = randomUUID();

        // Send message
        const response = await interaction.editReply(
            this.getMessageData(name, guid)
        );
        this.initializeCounter({
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

    get description()
    {
        return `Add a basic counter for adding/subtracting numbers.`;
    }

    private initializeCounter({
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
        type: CounterType;
    })
    {
        counterSingleton.upsert(new CounterContainer({
            guid,
            name,
            count: 0,
            auditLogs: [],
            discordCreator: {
                userId: interaction.user.id,
                ...(!!interaction.guildId
                    ? { serverId: interaction.guildId}
                    : {}
                ),
                channelId: interaction.channelId,
                messageId: response.id,
            },
        }, type));
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
        type,
    }: {
        originalInteraction: ChatInputCommandInteraction | MessageInteraction;
        interactionResponse: Message<boolean>;
        name: string;
        guid: UUID;
        type: CounterType;
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

    private updateCount(buttonInteraction: ButtonInteraction, guid: UUID)
    {
        const handlerMap: Record<ButtonName, () => void> = {
            [ButtonName.Plus]: () => counterSingleton.incrementCount({
                guid,
                userId: buttonInteraction.user.id
            }),
            [ButtonName.Minus]: () => counterSingleton.decrementCount({
                guid,
                userId: buttonInteraction.user.id
            }),
        };

        return handlerMap[buttonInteraction.customId as ButtonName]();
    }

    public async runOnStartup(bot: Client)
    {
        try
        {
            logger.debug('Initializing counters...');

            const { results = [] } = await CounterController.getAll({}) as {
                results: CounterForDb[];
            };

            const promises = results.map(async (counter) => {
                const {
                    discordCreator: {
                        channelId,
                        messageId,
                    },
                } = counter;

                // Get the message that the counter belongs to
                const channel = await bot.channels.fetch(channelId) as TextChannel;
                const message = await channel.messages.fetch(messageId);

                // Overwrite the count from the database with whatever's in the message
                const count = this.getCount(message);
                counter.count = count;

                // Save the counter to the cache
                counterSingleton.upsert(
                    new CounterContainer(counter, CounterType.Permanent, true)
                );

                // Add buttons to the message for counter
                await message.edit(
                    this.getMessageData(counter.name, counter.guid)
                );

                // Listen for button interactions
                this.handleButtonInteractions({
                    originalInteraction: message.interaction as MessageInteraction,
                    interactionResponse: message,
                    name: counter.name,
                    guid: counter.guid,
                    type: CounterType.Permanent,
                });
            });

            await Promise.all(promises);

            logger.debug('Counters intialized!');
        }
        catch (error)
        {
            logger.error('An error occurred while initializing pre-existing counters', error);
        }
    }

    private getCount(message: Message)
    {
        const indexOfAfterColon = message.content.indexOf(':') + 1;
        const countStr = message.content.slice(indexOfAfterColon).trim().replaceAll('*', '');
        return parseInt(countStr, 10);
    };
}



export default new Counter();
