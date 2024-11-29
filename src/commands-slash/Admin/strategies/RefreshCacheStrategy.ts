import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { rollOfDarknessNwodSpreadsheetId } from '../../Nwod/constants.js';
import { NwodSubcommandGroup } from '../../Nwod/options/index.js';
import { NwodLookupSubcommand } from '../../Nwod/options/lookup.js';
import { NwodStrategyExecutor } from '../../Nwod/strategies/index.js';
import { NwodLookupRange } from '../../Nwod/types/lookup.js';
import { NwodAutocompleteParameterName } from '../../Nwod/types/types.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import {
    AdminSubcommand,
    RefreshCacheCommand,
    SubcommandForRefreshCache,
} from '../options/index.js';

type RefreshCacheHandlerMap = {
    [RefreshCacheCommand.Nwod]: {
        [key in NwodAutocompleteParameterName]: {
            lookupSubcommand: NwodLookupSubcommand;
            keys: [string, NwodLookupRange];
        };
    };
};

type RefreshCacheOptionsMap = {
    [RefreshCacheCommand.Nwod]: object;
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
            [NwodAutocompleteParameterName.MeritName]: {
                keys: [rollOfDarknessNwodSpreadsheetId, NwodLookupRange.Merit],
                lookupSubcommand: NwodLookupSubcommand.Merit,
            },
        },
    };

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const command = interaction.options.getString('command', true) as RefreshCacheCommand;
        const subcommand = interaction.options.getString('subcommand', true) as SubcommandForRefreshCache;

        // Refresh the cache
        const { keys, lookupSubcommand } = this.handlerMap[command][subcommand];
        await this.refreshCache({
            command,
            keys,
            lookupSubcommand,
        });

        // Send response message
        await interaction.editReply(`The data for \`/${command} lookup ${lookupSubcommand}\` has been refreshed!`);

        return true;
    }

    private static async refreshCache({
        command,
        lookupSubcommand,
        keys,
    }: {
        command: RefreshCacheCommand;
        lookupSubcommand: NwodLookupSubcommand;
        keys: [string, string];
    }): Promise<void>
    {
        // Clear the cache
        CachedGoogleSheetsApiService.clearCache(keys);

        // Get options for re-fetching data
        const optionsMap: RefreshCacheOptionsMap = {
            [RefreshCacheCommand.Nwod]: { includeAllIfNoName: true },
        };
        const options = optionsMap[command];

        // Re-Fetch the data
        const handlerMap: Record<RefreshCacheCommand, () => Promise<unknown[]>> = {
            [RefreshCacheCommand.Nwod]: () => NwodStrategyExecutor.getLookupData({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: lookupSubcommand,
                options,
            }),
        };
        await handlerMap[command]();
    }
}
