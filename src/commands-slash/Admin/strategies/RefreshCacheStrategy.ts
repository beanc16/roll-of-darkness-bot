import { logger } from '@beanc16/logger';
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteFocusedOption,
    ChatInputCommandInteraction,
} from 'discord.js';

import { MAX_AUTOCOMPLETE_CHOICES } from '../../../constants/discord.js';
import { staticImplements } from '../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { DiscordUserId } from '../../../types/discord.js';
import { rollOfDarknessNwodSpreadsheetId } from '../../Nwod/constants.js';
import { NwodSubcommandGroup } from '../../Nwod/options/index.js';
import { NwodLookupSubcommand } from '../../Nwod/options/lookup.js';
import { NwodStrategyExecutor } from '../../Nwod/strategies/index.js';
import { NwodAutocompleteParameterName, NwodLookupRange } from '../../Nwod/types/lookup.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../Ptu/constants.js';
import { PtuSubcommandGroup } from '../../Ptu/options/index.js';
import { PtuLookupSubcommand } from '../../Ptu/options/lookup.js';
import { PtuStrategyExecutor } from '../../Ptu/strategies/index.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../Ptu/types/autocomplete.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { commandsForRefresh } from '../constants.js';
import { AdminSubcommand } from '../options/index.js';
import {
    CommandForRefreshCache,
    RefreshCacheCommand,
    SplitCommandForRefreshCache,
} from '../types.js';

type NwodAutocompleteParameterNameToCache = Exclude<
    NwodAutocompleteParameterName,
    NwodAutocompleteParameterName.ClarityConditionTag
>;

type PtuAutocompleteParameterNameToCache = Exclude<
    PtuAutocompleteParameterName,
    PtuAutocompleteParameterName.AuraUserName
    | PtuAutocompleteParameterName.BasedOnAbility
    | PtuAutocompleteParameterName.BasedOnMove
    | PtuAutocompleteParameterName.EggGroup1
    | PtuAutocompleteParameterName.EggGroup2
    | PtuAutocompleteParameterName.PokemonName
    | PtuAutocompleteParameterName.PokemonToEvolve
>;

interface GetHandlerResultResponse
{
    handlerResult: RefreshCacheHandlerMap[RefreshCacheCommand.Nwod][NwodAutocompleteParameterNameToCache] | RefreshCacheHandlerMap[RefreshCacheCommand.Ptu][PtuAutocompleteParameterNameToCache] | undefined;
    refreshCacheCommand: RefreshCacheCommand;
}

interface RefreshCacheResponse
{
    dataBeforeRefresh: { name: string }[];
    dataAfterRefresh: { name: string }[];
}

interface GetDataDiffResponse
{
    addedNames: string[];
    removedNames: string[];
}

type RefreshCacheHandlerMap = {
    [RefreshCacheCommand.Nwod]: {
        [key in NwodAutocompleteParameterNameToCache]: {
            lookupSubcommand: NwodLookupSubcommand;
            keys: [string, NwodLookupRange];
        };
    };
    [RefreshCacheCommand.Ptu]: {
        [key in PtuAutocompleteParameterNameToCache]: {
            lookupSubcommand: PtuLookupSubcommand;
            keys: [string, PtuLookupRange];
        };
    };
};

type RefreshCacheOptionsMap = {
    [RefreshCacheCommand.Nwod]: object;
    [RefreshCacheCommand.Ptu]: undefined;
};

@staticImplements<ChatIteractionStrategy>()
export class RefreshCacheStrategy
{
    public static key: AdminSubcommand.RefreshCache = AdminSubcommand.RefreshCache;

    private static handlerMap: RefreshCacheHandlerMap = {
        [RefreshCacheCommand.Nwod]: {
            [NwodAutocompleteParameterName.ConditionName]: {
                keys: [rollOfDarknessNwodSpreadsheetId, NwodLookupRange.Condition],
                lookupSubcommand: NwodLookupSubcommand.Condition,
            },
            [NwodAutocompleteParameterName.ContractName]: {
                keys: [rollOfDarknessNwodSpreadsheetId, NwodLookupRange.Contract],
                lookupSubcommand: NwodLookupSubcommand.Contract,
            },
            [NwodAutocompleteParameterName.GoblinFruitName]: {
                keys: [rollOfDarknessNwodSpreadsheetId, NwodLookupRange.GoblinFruit],
                lookupSubcommand: NwodLookupSubcommand.GoblinFruit,
            },
            [NwodAutocompleteParameterName.HauntName]: {
                keys: [rollOfDarknessNwodSpreadsheetId, NwodLookupRange.Haunt],
                lookupSubcommand: NwodLookupSubcommand.Haunt,
            },
            [NwodAutocompleteParameterName.KithName]: {
                keys: [rollOfDarknessNwodSpreadsheetId, NwodLookupRange.Kith],
                lookupSubcommand: NwodLookupSubcommand.Kith,
            },
            [NwodAutocompleteParameterName.MementoName]: {
                keys: [rollOfDarknessNwodSpreadsheetId, NwodLookupRange.Memento],
                lookupSubcommand: NwodLookupSubcommand.Memento,
            },
            [NwodAutocompleteParameterName.MeritName]: {
                keys: [rollOfDarknessNwodSpreadsheetId, NwodLookupRange.Merit],
                lookupSubcommand: NwodLookupSubcommand.Merit,
            },
            [NwodAutocompleteParameterName.NeedleName]: {
                keys: [rollOfDarknessNwodSpreadsheetId, NwodLookupRange.Needle],
                lookupSubcommand: NwodLookupSubcommand.Needle,
            },
            [NwodAutocompleteParameterName.RootAndBloomName]: {
                keys: [rollOfDarknessNwodSpreadsheetId, NwodLookupRange.RootAndBloom],
                lookupSubcommand: NwodLookupSubcommand.RootAndBloom,
            },
            [NwodAutocompleteParameterName.ThreadName]: {
                keys: [rollOfDarknessNwodSpreadsheetId, NwodLookupRange.Thread],
                lookupSubcommand: NwodLookupSubcommand.Thread,
            },
            [NwodAutocompleteParameterName.TiltName]: {
                keys: [rollOfDarknessNwodSpreadsheetId, NwodLookupRange.Tilt],
                lookupSubcommand: NwodLookupSubcommand.Tilt,
            },
            [NwodAutocompleteParameterName.TokenName]: {
                keys: [rollOfDarknessNwodSpreadsheetId, NwodLookupRange.Token],
                lookupSubcommand: NwodLookupSubcommand.Token,
            },
            [NwodAutocompleteParameterName.WeaponName]: {
                keys: [rollOfDarknessNwodSpreadsheetId, NwodLookupRange.Weapon],
                lookupSubcommand: NwodLookupSubcommand.Weapon,
            },
        },
        [RefreshCacheCommand.Ptu]: {
            [PtuAutocompleteParameterName.AbilityName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Ability],
                lookupSubcommand: PtuLookupSubcommand.Ability,
            },
            [PtuAutocompleteParameterName.Ability1]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Ability],
                lookupSubcommand: PtuLookupSubcommand.Ability,
            },
            [PtuAutocompleteParameterName.Ability2]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Ability],
                lookupSubcommand: PtuLookupSubcommand.Ability,
            },
            [PtuAutocompleteParameterName.Ability3]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Ability],
                lookupSubcommand: PtuLookupSubcommand.Ability,
            },
            [PtuAutocompleteParameterName.Ability4]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Ability],
                lookupSubcommand: PtuLookupSubcommand.Ability,
            },
            [PtuAutocompleteParameterName.AuraName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Aura],
                lookupSubcommand: PtuLookupSubcommand.Aura,
            },
            [PtuAutocompleteParameterName.BerryName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Berry],
                lookupSubcommand: PtuLookupSubcommand.Berry,
            },
            [PtuAutocompleteParameterName.CapabilityName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Capability],
                lookupSubcommand: PtuLookupSubcommand.Capability,
            },
            [PtuAutocompleteParameterName.ClassName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Feature],
                lookupSubcommand: PtuLookupSubcommand.Class,
            },
            [PtuAutocompleteParameterName.EdgeName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Edge],
                lookupSubcommand: PtuLookupSubcommand.Edge,
            },
            [PtuAutocompleteParameterName.EquipmentName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Equipment],
                lookupSubcommand: PtuLookupSubcommand.Equipment,
            },
            [PtuAutocompleteParameterName.EvolutionaryStone]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.EvolutionaryStone],
                lookupSubcommand: PtuLookupSubcommand.EvolutionaryStone,
            },
            [PtuAutocompleteParameterName.FeatureName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Feature],
                lookupSubcommand: PtuLookupSubcommand.Feature,
            },
            [PtuAutocompleteParameterName.FemaleSpecies]: { // This is part of the breeding command, but uses Pokemon data from the PTU spreadsheet
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.PokemonSkills],
                lookupSubcommand: PtuLookupSubcommand.Pokemon,
            },
            [PtuAutocompleteParameterName.GiftBlessingName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.GiftBlessing],
                lookupSubcommand: PtuLookupSubcommand.GiftBlessing,
            },
            [PtuAutocompleteParameterName.GiftBlessingPatron]: { // This is already covered by GiftBlessingName, just including for posterity
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.GiftBlessing],
                lookupSubcommand: PtuLookupSubcommand.GiftBlessing,
            },
            [PtuAutocompleteParameterName.HazardName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Hazard],
                lookupSubcommand: PtuLookupSubcommand.Hazard,
            },
            [PtuAutocompleteParameterName.HealingItem]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.HealingItem],
                lookupSubcommand: PtuLookupSubcommand.HealingItem,
            },
            [PtuAutocompleteParameterName.HeldItem]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.HeldItem],
                lookupSubcommand: PtuLookupSubcommand.HeldItem,
            },
            [PtuAutocompleteParameterName.KeyItemName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.KeyItem],
                lookupSubcommand: PtuLookupSubcommand.KeyItem,
            },
            [PtuAutocompleteParameterName.KeywordName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Keyword],
                lookupSubcommand: PtuLookupSubcommand.Keyword,
            },
            [PtuAutocompleteParameterName.MaleSpecies]: { // This is part of the breeding command, but uses Pokemon data from the PTU spreadsheet
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Pokemon],
                lookupSubcommand: PtuLookupSubcommand.Pokemon,
            },
            [PtuAutocompleteParameterName.MoveName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Move],
                lookupSubcommand: PtuLookupSubcommand.Move,
            },
            [PtuAutocompleteParameterName.NatureName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Nature],
                lookupSubcommand: PtuLookupSubcommand.Nature,
            },
            [PtuAutocompleteParameterName.PokeballName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Pokeball],
                lookupSubcommand: PtuLookupSubcommand.Pokeball,
            },
            [PtuAutocompleteParameterName.StatusName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Status],
                lookupSubcommand: PtuLookupSubcommand.Status,
            },
            [PtuAutocompleteParameterName.TagName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Tag],
                lookupSubcommand: PtuLookupSubcommand.Tag,
            },
            [PtuAutocompleteParameterName.TerrainName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Terrain],
                lookupSubcommand: PtuLookupSubcommand.Terrain,
            },
            [PtuAutocompleteParameterName.TmName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Tm],
                lookupSubcommand: PtuLookupSubcommand.Tm,
            },
            [PtuAutocompleteParameterName.VitaminName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Vitamin],
                lookupSubcommand: PtuLookupSubcommand.Vitamin,
            },
            [PtuAutocompleteParameterName.WeatherName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.Weather],
                lookupSubcommand: PtuLookupSubcommand.Weather,
            },
            [PtuAutocompleteParameterName.XItemName]: {
                keys: [rollOfDarknessPtuSpreadsheetId, PtuLookupRange.XItem],
                lookupSubcommand: PtuLookupSubcommand.XItem,
            },
        },
    };

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const command = interaction.options.getString('command', true) as CommandForRefreshCache;

        // Get data for refresh
        const handlerResult = this.getHandlerResult(command);

        if (!handlerResult.handlerResult)
        {
            logger.warn('Retrieved undefined handlerResult with the following data', {
                command,
            });
            await interaction.editReply(
                `Failed to refresh cache for \`${command}\`. `
                + `If you believe that this is an error, please contact this bot's owner for help fixing the issue.`,
            );
            return true;
        }

        // Refresh the cache
        const { refreshCacheCommand, handlerResult: { keys, lookupSubcommand } } = handlerResult;

        // Tell user they don't have permission to refresh the cache
        if (!this.canRefreshCache(refreshCacheCommand, interaction.user.id))
        {
            await interaction.editReply(
                `The owner of this bot has not given you permission to refresh the cache for ${refreshCacheCommand} commands. `
                + `If you feel that you should have this permission, please contact this bot's owner.`,
            );
            return true;
        }

        const response = await this.refreshCache({
            refreshCacheCommand,
            keys,
            lookupSubcommand,
        });

        // Get diff data
        const dataDiffResponse = this.getDataDiff(response);

        // Send response message
        const message = this.getResponseMessage({
            command,
            lookupSubcommand,
            dataDiffResponse,
        });
        await interaction.editReply(message);

        return true;
    }

    public static getAutocompleteChoices(focusedValue: AutocompleteFocusedOption): ApplicationCommandOptionChoiceData<string>[]
    {
        // Get the choices matching the search
        const data = commandsForRefresh.filter(choice =>
            choice.toLowerCase().startsWith(focusedValue.value.toLowerCase(), 0),
        )
            // Discord limits a maximum of 25 choices to display
            .slice(0, MAX_AUTOCOMPLETE_CHOICES);

        // Parse data to discord's format
        const choices = data.map<ApplicationCommandOptionChoiceData<string>>((choice) =>
        {
            return {
                name: choice,
                value: choice,
            };
        });

        return choices;
    }

    /* istanbul ignore next */
    private static getHandlerResult(
        command: CommandForRefreshCache,
    ): GetHandlerResultResponse
    {
        const [refreshCacheCommand, _second, autocompleteParameterName] = command.replace('/', '').split(' ') as SplitCommandForRefreshCache;

        const response: GetHandlerResultResponse = {
            refreshCacheCommand,
            handlerResult: undefined,
        };

        if (refreshCacheCommand === RefreshCacheCommand.Nwod)
        {
            response.handlerResult = this.handlerMap[refreshCacheCommand][`${autocompleteParameterName}_name` as NwodAutocompleteParameterNameToCache];
        }

        else if (refreshCacheCommand === RefreshCacheCommand.Ptu)
        {
            response.handlerResult = this.handlerMap[refreshCacheCommand][`${autocompleteParameterName}_name` as PtuAutocompleteParameterNameToCache];
        }

        return response;
    }

    /* istanbul ignore next */
    private static canRefreshCache(refreshCacheCommand: RefreshCacheCommand, userId: string): boolean
    {
        const discordUserIdsWithPermissionsToRefresh: Record<RefreshCacheCommand, string[]> = {
            [RefreshCacheCommand.Nwod]: [
                DiscordUserId.Bean,
                DiscordUserId.Avery,
            ],
            [RefreshCacheCommand.Ptu]: [
                DiscordUserId.Bean,
                DiscordUserId.Josh,
            ],
        };

        return discordUserIdsWithPermissionsToRefresh[refreshCacheCommand].includes(userId);
    }

    private static async refreshCache({
        refreshCacheCommand,
        lookupSubcommand,
        keys,
    }: {
        refreshCacheCommand: RefreshCacheCommand;
        lookupSubcommand: NwodLookupSubcommand | PtuLookupSubcommand;
        keys: [string, string];
    }): Promise<RefreshCacheResponse>
    {
        // Get options for re-fetching data
        const optionsMap: RefreshCacheOptionsMap = {
            [RefreshCacheCommand.Nwod]: { includeAllIfNoName: true, sortBy: 'name' },
            [RefreshCacheCommand.Ptu]: undefined,
        };
        const options = optionsMap[refreshCacheCommand];

        // Set up handler for fetching data
        const handlerMap: Record<RefreshCacheCommand, () => Promise<{ name: string }[]>> = {
            [RefreshCacheCommand.Nwod]: () => NwodStrategyExecutor.getLookupData({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: lookupSubcommand as NwodLookupSubcommand,
                options: options as object,
            }),
            [RefreshCacheCommand.Ptu]: () => PtuStrategyExecutor.getLookupData({
                subcommandGroup: PtuSubcommandGroup.Lookup,
                subcommand: lookupSubcommand as PtuLookupSubcommand,
                ...(options !== undefined ? { options } : {}),
            }),
        };

        // Get the data before the refresh
        const dataBeforeRefresh = await handlerMap[refreshCacheCommand]();

        // Clear the cache
        CachedGoogleSheetsApiService.clearCache(keys);

        // Re-Fetch the data
        const dataAfterRefresh = await handlerMap[refreshCacheCommand]();

        return { dataBeforeRefresh, dataAfterRefresh };
    }

    private static getDataDiff(
        { dataBeforeRefresh, dataAfterRefresh }: RefreshCacheResponse,
    ): GetDataDiffResponse
    {
        const dataBeforeRefreshSet = new Set(
            dataBeforeRefresh.reduce<string[]>((acc, cur) => acc.concat(cur.name), []),
        );
        const dataAfterRefreshSet = new Set(
            dataAfterRefresh.reduce<string[]>((acc, cur) => acc.concat(cur.name), []),
        );

        // Get names of data that was removed
        const removedNames = dataBeforeRefresh.reduce<Set<string>>((acc, { name }) =>
        {
            if (!dataAfterRefreshSet.has(name) && name && name.trim() !== '')
            {
                acc.add(name);
            }

            return acc;
        }, new Set<string>());

        // Get names of data that was added
        const addedNames = dataAfterRefresh.reduce<Set<string>>((acc, { name }) =>
        {
            if (!dataBeforeRefreshSet.has(name) && name && name.trim() !== '')
            {
                acc.add(name);
            }

            return acc;
        }, new Set<string>());

        return { addedNames: [...addedNames], removedNames: [...removedNames] };
    }

    /* istanbul ignore next */
    private static getResponseMessage({
        command,
        lookupSubcommand,
        dataDiffResponse,
    }: {
        command: CommandForRefreshCache;
        lookupSubcommand: NwodLookupSubcommand | PtuLookupSubcommand;
        dataDiffResponse: GetDataDiffResponse ;
    }): string
    {
        const lines = [
            `The data for \`${command}\` has been refreshed!`,
        ];

        const { addedNames, removedNames } = dataDiffResponse;

        if (addedNames.length > 0)
        {
            lines.push(`\nAdded ${lookupSubcommand}s:`);
            lines.push(`- ${addedNames.join('\n- ')}`);
        }

        if (removedNames.length > 0)
        {
            lines.push(`\nRemoved ${lookupSubcommand}s:`);
            lines.push(`- ${removedNames.join('\n- ')}`);
        }

        return lines.join('\n');
    }
}
