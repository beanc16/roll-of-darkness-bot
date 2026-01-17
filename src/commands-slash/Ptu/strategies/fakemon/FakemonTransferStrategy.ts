import { Text } from '@beanc16/discordjs-helpers';
import { logger } from '@beanc16/logger';
import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { RecordSingleton } from '../../../../services/Singleton/RecordSingleton.js';
import { ConfirmDenyButtonActionRowBuilder, ConfirmDenyButtonCustomIds } from '../../../shared/components/ConfirmDenyButtonActionRowBuilder.js';
import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PtuFakemonSubcommand } from '../../options/fakemon.js';
import { FakemonDataTransferService } from '../../services/FakemonDataManagers/dataTransfer/services/FakemonDataTransferService.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import type {
    PtuButtonIteractionStrategy,
    PtuChatIteractionStrategy,
    PtuStrategyMap,
    PtuStrategyMetadata,
} from '../../types/strategies.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { LookupPokemonStrategy } from '../lookup/LookupPokemonStrategy.js';

interface FakemonTransferGetParameterResults
{
    speciesName: string;
    destinations: string[];
}

@staticImplements<
    PtuChatIteractionStrategy
    & PtuButtonIteractionStrategy
>()
export class FakemonTransferStrategy
{
    public static key = PtuFakemonSubcommand.Transfer;
    public static destinationCache = new RecordSingleton<string, string[]>();

    public static async run(interaction: ChatInputCommandInteraction, strategies: PtuStrategyMap, options?: never): Promise<boolean>;
    public static async run(interaction: ButtonInteraction, strategies: PtuStrategyMap, options?: Partial<FakemonTransferGetParameterResults>): Promise<boolean>;
    public static async run(interaction: StringSelectMenuInteraction, strategies: PtuStrategyMap, options?: Partial<FakemonTransferGetParameterResults>): Promise<boolean>;
    public static async run(
        interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
        _strategies: PtuStrategyMap,
        options?: Partial<FakemonTransferGetParameterResults>,
    ): Promise<boolean>
    {
        const { speciesName, destinations } = this.getOptions(interaction as ButtonInteraction, options);

        // Get fakemon
        const [fakemon] = await PtuFakemonPseudoCache.getByNames([speciesName], interaction.user.id);
        if (!fakemon)
        {
            await interaction.editReply({
                content: `Fakemon titled \`${speciesName}\` does not exist or you are not an editor of it.`,
            });
            return true;
        }

        // Send transfer confirmation message
        const message = await interaction.fetchReply();
        await interaction.followUp({
            content: [
                `Are you sure that you want to transfer ${Text.Code.oneLine(speciesName)}${
                    destinations.length > 0 ? ` to ${Text.Code.oneLine(destinations.join(', '))}` : ''
                }?`,
                this.convertTransferredToForDisplay(fakemon),
            ].join('\n'),
            components: [
                new ConfirmDenyButtonActionRowBuilder(),
            ],
        });

        // Add to cache
        PtuFakemonPseudoCache.addToCache(message.id, fakemon);
        this.destinationCache.upsert(message.id, destinations);

        return true;
    }

    public static async runButton(
        interaction: ButtonInteraction,
        strategies: PtuStrategyMap,
        _metadata: PtuStrategyMetadata,
    ): Promise<boolean>
    {
        // Defer update
        await interaction.deferUpdate();

        const { customId } = interaction as { customId: ConfirmDenyButtonCustomIds };
        const fakemon = PtuFakemonPseudoCache.getByMessageId(interaction.message.id);
        if (!fakemon)
        {
            throw new Error('Fakemon not found');
        }
        if (!fakemon.editors.includes(interaction.user.id))
        {
            throw new Error('You do not have permission to edit this fakemon');
        }

        switch (customId)
        {
            case ConfirmDenyButtonCustomIds.Confirm:
                try
                {
                    // Send first response
                    await interaction.followUp({
                        content: `Beginning data transfer for ${Text.Code.oneLine(fakemon.name)}. Please be patient, this may take a few seconds...`,
                    });

                    // Get destinations
                    const destinations = this.destinationCache.get(interaction.message.id);
                    if (!destinations)
                    {
                        throw new Error('Destinations not found');
                    }

                    // Transfer fakemon
                    const service = new FakemonDataTransferService();
                    await service.transfer(fakemon, destinations);

                    // Get updated fakemon
                    const [updatedFakemon] = await PtuFakemonPseudoCache.getByNames([fakemon.name], interaction.user.id);

                    // Send response
                    await (strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Pokemon] as typeof LookupPokemonStrategy)?.run(interaction, strategies, {
                        names: [updatedFakemon.name],
                        interactionType: 'followUp',
                    });
                    await interaction.followUp({
                        content: [
                            `Fakemon ${Text.Code.oneLine(updatedFakemon.name)} transferred to the following locations:`,
                            this.convertTransferredToForDisplay(updatedFakemon),
                        ].join('\n'),
                    });
                    await interaction.message.edit({
                        content: `Successfully transferred ${Text.Code.oneLine(updatedFakemon.name)}.`,
                        components: [], // Remove buttons so transfer doesn't occur again
                    });
                }
                catch (error)
                {
                    logger.error('Failed to transfer fakemon', error);
                    const errorMessage = (error as Error)?.message;
                    await interaction.followUp({
                        content: [
                            `Failed to transfer fakemon${errorMessage ? ' with error:' : ''}`,
                            ...(errorMessage ? [Text.Code.multiLine(errorMessage)] : []),
                        ].join('\n'),
                        ephemeral: true,
                    });
                }
                break;

            case ConfirmDenyButtonCustomIds.Deny:
                // Send response
                await interaction.editReply({
                    content: `Canceled transferring ${Text.Code.oneLine(fakemon.name)}.`,
                    components: [],
                });
                break;

            default:
                const typeCheck: never = customId;
                throw new Error(`Unknown customId: ${typeCheck}`);
        }

        return true;
    }

    private static getOptions(interaction: ChatInputCommandInteraction, options?: never): FakemonTransferGetParameterResults;
    private static getOptions(interaction: ButtonInteraction, options?: Partial<FakemonTransferGetParameterResults>): FakemonTransferGetParameterResults;
    private static getOptions(interaction: StringSelectMenuInteraction, options?: Partial<FakemonTransferGetParameterResults>): FakemonTransferGetParameterResults;
    private static getOptions(
        untypedInteraction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
        options?: FakemonTransferGetParameterResults,
    ): FakemonTransferGetParameterResults
    {
        if (options)
        {
            return options;
        }

        const interaction = untypedInteraction as ChatInputCommandInteraction;

        const speciesName = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName, true);
        const destination1 = interaction.options.getString('destination_1');
        const destination2 = interaction.options.getString('destination_2');
        const destination3 = interaction.options.getString('destination_3');

        // Set unique destinations
        const destinationsSet = new Set<string>();
        [
            destination1,
            destination2,
            destination3,
        ].forEach(element =>
        {
            if (element && !destinationsSet.has(element))
            {
                destinationsSet.add(element);
            }
        });

        return { speciesName, destinations: [...destinationsSet] };
    }

    private static convertTransferredToForDisplay(fakemon: Pick<PtuFakemonCollection, 'transferredTo'>): string
    {
        return Text.Code.multiLine(
            JSON.stringify(fakemon.transferredTo, null, 2),
        );
    }
}
