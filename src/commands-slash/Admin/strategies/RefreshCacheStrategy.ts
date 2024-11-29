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

interface RefreshCacheResponse
{
    dataBeforeRefresh: { name: string }[] | undefined;
    dataAfterRefresh: { name: string }[];
}

interface GetDataDiffResponse
{
    addedNames: string[];
    removedNames: string[];
}

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
        const response = await this.refreshCache({
            command,
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

    private static async refreshCache({
        command,
        lookupSubcommand,
        keys,
    }: {
        command: RefreshCacheCommand;
        lookupSubcommand: NwodLookupSubcommand;
        keys: [string, string];
    }): Promise<RefreshCacheResponse>
    {
        // Get the data before the refresh
        const { data } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: keys[0],
            range: keys[1],
        });

        const dataBeforeRefresh = (data !== undefined)
            ? data.map(([name]) =>
            {
                return { name };
            })
            : undefined;

        // Clear the cache
        CachedGoogleSheetsApiService.clearCache(keys);

        // Get options for re-fetching data
        const optionsMap: RefreshCacheOptionsMap = {
            [RefreshCacheCommand.Nwod]: { includeAllIfNoName: true },
        };
        const options = optionsMap[command];

        // Re-Fetch the data
        const handlerMap: Record<RefreshCacheCommand, () => Promise<{ name: string }[]>> = {
            [RefreshCacheCommand.Nwod]: () => NwodStrategyExecutor.getLookupData({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: lookupSubcommand,
                options,
            }),
        };
        const dataAfterRefresh = await handlerMap[command]();

        return { dataBeforeRefresh, dataAfterRefresh };
    }

    private static getDataDiff(
        { dataBeforeRefresh, dataAfterRefresh }: RefreshCacheResponse,
    ): GetDataDiffResponse | undefined
    {
        if (dataBeforeRefresh === undefined)
        {
            return undefined;
        }

        const dataBeforeRefreshSet = new Set(
            dataBeforeRefresh.reduce<string[]>((acc, cur) => acc.concat(cur.name), []),
        );
        const dataAfterRefreshSet = new Set(
            dataAfterRefresh.reduce<string[]>((acc, cur) => acc.concat(cur.name), []),
        );

        // Get names of data that was removed
        const removedNames = dataBeforeRefresh.reduce<string[]>((acc, { name }) =>
        {
            if (!dataAfterRefreshSet.has(name) && name && name.trim() !== '')
            {
                acc.push(name);
            }

            return acc;
        }, []);

        // Get names of data that was added
        const addedNames = dataAfterRefresh.reduce<string[]>((acc, { name }) =>
        {
            if (!dataBeforeRefreshSet.has(name) && name && name.trim() !== '')
            {
                acc.push(name);
            }

            return acc;
        }, []);

        return { addedNames, removedNames };
    }

    private static getResponseMessage({
        command,
        lookupSubcommand,
        dataDiffResponse,
    }: {
        command: RefreshCacheCommand;
        lookupSubcommand: NwodLookupSubcommand;
        dataDiffResponse: GetDataDiffResponse | undefined;
    }): string
    {
        const message = `The data for \`/${command} lookup ${lookupSubcommand}\` has been refreshed!`;

        if (dataDiffResponse)
        {
            const { addedNames, removedNames } = dataDiffResponse;

            const lines = [message];

            if (addedNames.length > 0)
            {
                lines.push(`\nAdded ${lookupSubcommand}s`);
                lines.push(`- ${addedNames.join('\n- ')}`);
            }

            if (removedNames.length > 0)
            {
                lines.push(`\nRemoved ${lookupSubcommand}s`);
                lines.push(`- ${removedNames.join('\n- ')}`);
            }

            return lines.join('\n');
        }

        return message;
    }
}
