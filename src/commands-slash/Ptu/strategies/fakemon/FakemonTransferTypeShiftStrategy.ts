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
import { PtuFakemonCollection, PtuFakemonDexType } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PtuFakemonSubcommand } from '../../options/fakemon.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { FakemonTypeShiftDataTransferService } from '../../services/FakemonDataManagers/dataTransfer/services/FakemonTypeShiftDataTransferService.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import type {
    PtuButtonIteractionStrategy,
    PtuChatIteractionStrategy,
    PtuStrategyMap,
    PtuStrategyMetadata,
} from '../../types/strategies.js';
import type { LookupPokemonStrategy } from '../lookup/LookupPokemonStrategy.js';
import type { FakemonDeleteStrategy } from './FakemonDeleteStrategy.js';

interface FakemonTransferTypeShiftGetParameterResults
{
    speciesName: string;
    typeShiftOfSpeciesName: string;
    dexType: PtuFakemonDexType;
    destinations: string[];
}

@staticImplements<
    PtuChatIteractionStrategy
    & PtuButtonIteractionStrategy
>()
export class FakemonTransferTypeShiftStrategy
{
    public static key = PtuFakemonSubcommand.TransferTypeShift;
    public static destinationCache = new RecordSingleton<string, {
        dexType: PtuFakemonDexType;
        destinations: string[];
    }>();

    public static async run(interaction: ChatInputCommandInteraction, strategies: PtuStrategyMap, options?: never): Promise<boolean>;
    public static async run(interaction: ButtonInteraction, strategies: PtuStrategyMap, options?: Partial<FakemonTransferTypeShiftGetParameterResults>): Promise<boolean>;
    public static async run(interaction: StringSelectMenuInteraction, strategies: PtuStrategyMap, options?: Partial<FakemonTransferTypeShiftGetParameterResults>): Promise<boolean>;
    public static async run(
        interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
        strategies: PtuStrategyMap,
        options?: Partial<FakemonTransferTypeShiftGetParameterResults>,
    ): Promise<boolean>
    {
        const {
            speciesName,
            typeShiftOfSpeciesName,
            dexType,
            destinations,
        } = this.getOptions(interaction as ButtonInteraction, options);

        // Get fakemon
        const [fakemon] = await PtuFakemonPseudoCache.getByNames([speciesName], interaction.user.id);
        if (!fakemon)
        {
            await interaction.editReply({
                content: `Fakemon titled \`${speciesName}\` does not exist or you are not an editor of it.`,
            });
            return true;
        }

        // Get base species
        // eslint-disable-next-line no-unsafe-optional-chaining
        const [baseSpecies] = await (strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Pokemon] as typeof LookupPokemonStrategy)?.getLookupData({
            names: [typeShiftOfSpeciesName],
        });
        if (!baseSpecies)
        {
            await interaction.editReply({
                content: `Pokemon titled \`${baseSpecies}\` does not exist.`,
            });
            return true;
        }

        // Update type shift information
        const message = await interaction.fetchReply();
        const updatedFakemon = await PtuFakemonPseudoCache.update(message.id, { id: fakemon.id }, {
            typeShiftOfPokemonName: typeShiftOfSpeciesName,
        });

        // Send transfer confirmation message
        await interaction.followUp({
            content: [
                `Are you sure that you want to transfer ${Text.Code.oneLine(speciesName)} as a type shift of ${Text.Code.oneLine(typeShiftOfSpeciesName)}${
                    destinations.length > 0 ? ` to ${Text.Code.oneLine(destinations.join(', '))}` : ''
                }?`,
                this.convertTransferredToForDisplay(updatedFakemon),
            ].join('\n'),
            components: [
                new ConfirmDenyButtonActionRowBuilder(),
            ],
        });

        // Add to cache
        PtuFakemonPseudoCache.addToCache(message.id, updatedFakemon);
        this.destinationCache.upsert(message.id, {
            dexType,
            destinations,
        });

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
        if (!fakemon.typeShiftOfPokemonName)
        {
            throw new Error('Name of Pokemon that fakemon is a type shift of is not set');
        }

        switch (customId)
        {
            case ConfirmDenyButtonCustomIds.Confirm:
                try
                {
                    // Send first response
                    await interaction.followUp({
                        content: `Beginning data transfer for ${Text.Code.oneLine(fakemon.name)} as a type shift of ${Text.Code.oneLine(fakemon.typeShiftOfPokemonName)}. Please be patient, this may take a few seconds...`,
                    });

                    // Get destinations
                    const { dexType, destinations } = this.destinationCache.get(interaction.message.id);
                    if (!dexType)
                    {
                        throw new Error('Dex type not found');
                    }
                    if (!destinations)
                    {
                        throw new Error('Destinations not found');
                    }

                    // Transfer fakemon type shift
                    const service = new FakemonTypeShiftDataTransferService();
                    await service.transfer({
                        ...fakemon,
                        dexType,
                    } as typeof fakemon, destinations);

                    // Get updated fakemon
                    const [updatedFakemon] = await PtuFakemonPseudoCache.getByNames([fakemon.name], interaction.user.id);

                    // Send response
                    if (updatedFakemon.transferredTo.ptuDatabase)
                    {
                        await (strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Pokemon] as typeof LookupPokemonStrategy)?.run(interaction, strategies, {
                            names: [fakemon.typeShiftOfPokemonName],
                            interactionType: 'followUp',
                        });
                    }
                    await interaction.followUp({
                        content: [
                            `Fakemon ${Text.Code.oneLine(updatedFakemon.name)} transferred as a type shift of ${Text.Code.oneLine(fakemon.typeShiftOfPokemonName)} to the following locations:`,
                            this.convertTransferredToForDisplay(updatedFakemon),
                        ].join('\n'),
                    });
                    await interaction.message.edit({
                        content: `Successfully transferred ${Text.Code.oneLine(updatedFakemon.name)} as a type shift of ${Text.Code.oneLine(fakemon.typeShiftOfPokemonName)}.`,
                        components: [], // Remove buttons so transfer doesn't occur again
                    });

                    // Delete the fakemon if it's transferred to all locations
                    if (
                        updatedFakemon.transferredTo.ptuDatabase
                        && updatedFakemon.transferredTo.googleSheets.pokemonData
                        && updatedFakemon.transferredTo.googleSheets.pokemonSkills
                        && updatedFakemon.transferredTo.imageStorage
                    )
                    {
                        await (strategies[PtuSubcommandGroup.Fakemon][PtuFakemonSubcommand.Delete] as typeof FakemonDeleteStrategy)?.run(interaction, strategies, {
                            speciesName: updatedFakemon.name,
                        });
                    }
                }
                catch (error)
                {
                    logger.error('Failed to transfer fakemon as a type shift', error, { fakemonName: fakemon.name, typeShiftOfPokemonName: fakemon.typeShiftOfPokemonName });
                    const errorMessage = (error as Error)?.message;
                    await interaction.followUp({
                        content: [
                            `Failed to transfer fakemon as a type shift${errorMessage ? ' with error:' : ''}`,
                            ...(errorMessage ? [Text.Code.multiLine(errorMessage)] : []),
                        ].join('\n'),
                        ephemeral: true,
                    });
                }
                break;

            case ConfirmDenyButtonCustomIds.Deny:
                // Send response
                await interaction.editReply({
                    content: `Canceled transferring ${Text.Code.oneLine(fakemon.name)} as a type shift of ${Text.Code.oneLine(fakemon.typeShiftOfPokemonName)}.`,
                    components: [],
                });
                break;

            default:
                const typeCheck: never = customId;
                throw new Error(`Unknown customId: ${typeCheck}`);
        }

        return true;
    }

    private static getOptions(interaction: ChatInputCommandInteraction, options?: never): FakemonTransferTypeShiftGetParameterResults;
    private static getOptions(interaction: ButtonInteraction, options?: Partial<FakemonTransferTypeShiftGetParameterResults>): FakemonTransferTypeShiftGetParameterResults;
    private static getOptions(interaction: StringSelectMenuInteraction, options?: Partial<FakemonTransferTypeShiftGetParameterResults>): FakemonTransferTypeShiftGetParameterResults;
    private static getOptions(
        untypedInteraction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
        options?: FakemonTransferTypeShiftGetParameterResults,
    ): FakemonTransferTypeShiftGetParameterResults
    {
        if (options)
        {
            return options;
        }

        const interaction = untypedInteraction as ChatInputCommandInteraction;

        const speciesName = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName, true);
        const typeShiftOfSpeciesName = interaction.options.getString(PtuAutocompleteParameterName.PokemonName, true);
        const dexType = interaction.options.getString('dex_type', true) as PtuFakemonDexType;
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

        return {
            speciesName,
            typeShiftOfSpeciesName,
            dexType,
            destinations: [...destinationsSet],
        };
    }

    private static convertTransferredToForDisplay(fakemon: Pick<PtuFakemonCollection, 'transferredTo'>): string
    {
        return Text.Code.multiLine(
            JSON.stringify(fakemon.transferredTo, null, 2),
        );
    }
}
