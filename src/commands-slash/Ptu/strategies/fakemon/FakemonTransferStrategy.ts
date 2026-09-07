import { Text } from '@beanc16/discordjs-helpers';
import { logger } from '@beanc16/logger';
import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { RecordSingleton } from '../../../../services/Singleton/RecordSingleton.js';
import { DiscordUserId } from '../../../../types/discord.js';
import { ConfirmDenyButtonActionRowBuilder, ConfirmDenyButtonCustomIds } from '../../../shared/components/ConfirmDenyButtonActionRowBuilder.js';
import { getEditorOfDex, isEditorOfDex } from '../../constants.js';
import { PtuFakemonCollection, PtuFakemonDexType } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PtuFakemonSubcommand } from '../../options/fakemon.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { FakemonDataTransferService } from '../../services/FakemonDataManagers/dataTransfer/services/FakemonDataTransferService.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import type {
    PtuButtonIteractionStrategy,
    PtuChatIteractionStrategy,
    PtuStrategyMap,
    PtuStrategyMetadata,
} from '../../types/strategies.js';
import { LookupPokemonStrategy } from '../lookup/LookupPokemonStrategy.js';
import type { FakemonDeleteStrategy } from './FakemonDeleteStrategy.js';

export interface FakemonTransferGetParameterResults
{
    speciesNames: string[];
    dexType: PtuFakemonDexType;
    destinations: string[];
}

@staticImplements<
    PtuChatIteractionStrategy
    & PtuButtonIteractionStrategy
>()
export class FakemonTransferStrategy
{
    public static key = PtuFakemonSubcommand.Transfer;
    public static destinationCache = new RecordSingleton<string, {
        dexType: PtuFakemonDexType;
        destinations: string[];
    }>();

    public static async run(interaction: ChatInputCommandInteraction, strategies: PtuStrategyMap, options?: never): Promise<boolean>;
    public static async run(interaction: ButtonInteraction, strategies: PtuStrategyMap, options?: Partial<FakemonTransferGetParameterResults>): Promise<boolean>;
    public static async run(interaction: StringSelectMenuInteraction, strategies: PtuStrategyMap, options?: Partial<FakemonTransferGetParameterResults>): Promise<boolean>;
    public static async run(
        interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
        _strategies: PtuStrategyMap,
        options?: Partial<FakemonTransferGetParameterResults>,
    ): Promise<boolean>
    {
        const {
            speciesNames,
            dexType,
            destinations,
        } = this.getOptions(interaction as ButtonInteraction, options);

        // Get fakemon
        const fakemons = await this.getFakemons(speciesNames, interaction.user.id);
        if (fakemons.length !== speciesNames.length)
        {
            const missingNames = speciesNames
                .filter((name) => !fakemons.find((fakemon) => fakemon.name === name))
                .join('`, `');
            await interaction.editReply({
                content: `Fakemon titled \`${missingNames}\` does not exist or you are not an editor of ${missingNames.length === 1 ? 'it' : 'them'}.`,
            });
            return true;
        }

        // Send transfer confirmation message
        const message = await interaction.fetchReply();
        const speciesNamesStr = Text.Code.oneLine(speciesNames.join('`, `'));
        await interaction.followUp({
            content: [
                `Are you sure that you want to transfer ${speciesNamesStr}${
                    destinations.length > 0 ? ` to ${Text.Code.oneLine(destinations.join(', '))}` : ''
                }?`,
                '',
                this.convertTransferredToForDisplay(fakemons),
            ].join('\n'),
            components: [
                new ConfirmDenyButtonActionRowBuilder(),
            ],
        });

        // Add to cache
        PtuFakemonPseudoCache.addToCacheBulk(message.id, fakemons);
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
        const untypedFakemons = PtuFakemonPseudoCache.getByMessageIdBulk(interaction.message.id);
        const errorMessages: string[] = [];

        // Not found error
        if (!untypedFakemons || untypedFakemons.length === 0)
        {
            errorMessages.push('Fakemon not found');
        }

        // Do not have permission error
        const fakemonWithoutEditingPermission = untypedFakemons?.filter((fakemon) => !fakemon.editors.includes(interaction.user.id)) ?? [];
        if (fakemonWithoutEditingPermission.length > 0)
        {
            errorMessages.push(`You do not have permission to edit ${fakemonWithoutEditingPermission.map(({ name }) => name).join(', ')}`);
        }

        // Cannot edit dex error
        const dexTypesSet = new Set<PtuFakemonDexType>();
        const fakemonWithoutDexPermission = untypedFakemons?.reduce<PtuFakemonCollection[]>((acc, fakemon) =>
        {
            if (!dexTypesSet.has(fakemon.dexType) && !isEditorOfDex(fakemon.dexType, interaction.user.id as DiscordUserId))
            {
                dexTypesSet.add(fakemon.dexType);
                acc.push(fakemon);
            }
            return acc;
        }, []) ?? [];
        if (fakemonWithoutDexPermission.length > 0)
        {
            fakemonWithoutDexPermission.forEach(({ dexType }) =>
            {
                const editors = getEditorOfDex(dexType);
                const editorPings = editors.map((editor) => Text.Ping.user(editor)).join(', ');
                errorMessages.push(`You do not have permission to create a pokemon in the ${dexType} Dex. Please ask ${editorPings} for approval.`);
            });
        }

        // Send error(s)
        if (errorMessages.length > 0)
        {
            await interaction.followUp({
                content: 'The following errors were found:\n' + errorMessages.join('\n- '),
                ephemeral: true,
            });
            return true;
        }

        const fakemons = untypedFakemons!;
        const fakemonNames = fakemons.map(({ name }) => name);
        const fakemonNamesCode = Text.Code.oneLine(fakemonNames.join('`, `'));

        switch (customId)
        {
            case ConfirmDenyButtonCustomIds.Confirm:
                try
                {
                    // Send first response
                    await interaction.followUp({
                        content: `Beginning data transfer for ${Text.Code.oneLine(fakemons.map(({ name }) => name).join('`, `'))}. Please be patient, this may take a few seconds...`,
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

                    // Transfer fakemon
                    const service = new FakemonDataTransferService();
                    await service.transferBulk(fakemons.map((fakemon) => ({
                        ...fakemon,
                        dexType,
                    } as typeof fakemon)), destinations);

                    // Get updated fakemon
                    const updatedFakemons = await this.getFakemons(fakemonNames, interaction.user.id);

                    // Send preview response
                    for (let index = 0; index < updatedFakemons.length; index += 1)
                    {
                        const updatedFakemon = updatedFakemons[index];
                        if (updatedFakemon.transferredTo.ptuDatabase)
                        {
                            /* eslint-disable-next-line no-await-in-loop -- We want this to be sequential */
                            await (strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Pokemon] as typeof LookupPokemonStrategy)?.run(interaction, strategies, {
                                names: [updatedFakemon.name],
                                interactionType: 'followUp',
                            });
                        }
                    }

                    // Send success response
                    await interaction.followUp({
                        content: [
                            `Fakemon ${fakemonNamesCode} transferred to the following locations:`,
                            this.convertTransferredToForDisplay(updatedFakemons),
                        ].join('\n'),
                    });
                    await interaction.message.edit({
                        content: `Successfully transferred ${fakemonNamesCode}.`,
                        components: [], // Remove buttons so transfer doesn't occur again
                    });

                    // Send delete response
                    for (let index = 0; index < updatedFakemons.length; index += 1)
                    {
                        const updatedFakemon = updatedFakemons[index];
                        // Delete the fakemon if it's transferred to all locations
                        if (
                            updatedFakemon.transferredTo.ptuDatabase
                            && updatedFakemon.transferredTo.googleSheets.pokemonData
                            && updatedFakemon.transferredTo.googleSheets.pokemonSkills
                            && updatedFakemon.transferredTo.imageStorage
                        )
                        {
                            /* eslint-disable-next-line no-await-in-loop -- We want this to be sequential */
                            await (strategies[PtuSubcommandGroup.Fakemon][PtuFakemonSubcommand.Delete] as typeof FakemonDeleteStrategy)?.run(interaction, strategies, {
                                speciesName: updatedFakemon.name,
                            });
                        }
                    }
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
                    content: `Canceled transferring ${fakemonNamesCode}.`,
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

        const speciesName = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName);
        const speciesName1 = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName1);
        const speciesName2 = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName2);
        const speciesName3 = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName3);
        const speciesName4 = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName4);
        const speciesName5 = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName5);
        const speciesName6 = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName6);
        const speciesName7 = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName7);
        const speciesName8 = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName8);
        const speciesName9 = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName9);
        const speciesName10 = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName10);
        const speciesName11 = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName11);
        const speciesName12 = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName12);

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
            speciesNames: [
                speciesName,
                speciesName1,
                speciesName2,
                speciesName3,
                speciesName4,
                speciesName5,
                speciesName6,
                speciesName7,
                speciesName8,
                speciesName9,
                speciesName10,
                speciesName11,
                speciesName12,
            ].filter(Boolean) as string[],
            dexType,
            destinations: [...destinationsSet],
        };
    }

    private static convertTransferredToForDisplay(fakemon: Pick<PtuFakemonCollection, 'name' | 'transferredTo'>[]): string
    {
        return fakemon.reduce<string[]>((acc, { name, transferredTo }) =>
            acc.concat([
                `${Text.Code.oneLine(name)}:`,
                Text.Code.multiLine(JSON.stringify(transferredTo, null, 2)),
            ].join('\n')), [],
        ).join('\n');
    }

    /**
     * The database auto-alphabetizes fakemon due to an index.
     * We *do not* want that - we want to transfer fakemon in a
     * very specific order. Thus, we retrieve the alphabetized
     * fakemon and put them back in the order `speciesNames` is in.
     */
    private static async getFakemons(speciesNames: string[], interactionUserId: string): Promise<PtuFakemonCollection[]>
    {
        const alphabetizedFakemons = await PtuFakemonPseudoCache.getByNames(speciesNames, interactionUserId);

        const nameToFakemon = alphabetizedFakemons.reduce<Record<string, PtuFakemonCollection>>((acc, cur) =>
        {
            acc[cur.name] = cur;
            return acc;
        }, {});

        return speciesNames.map(name => nameToFakemon[name]);
    }
}
