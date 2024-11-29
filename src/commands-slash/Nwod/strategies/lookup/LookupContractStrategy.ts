import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessNwodSpreadsheetId } from '../../constants.js';
import { getLookupContractsEmbedMessages } from '../../embed-messages/lookup.js';
import { NwodLookupSubcommand } from '../../options/lookup.js';
import { ChangelingContract } from '../../types/ChangelingContract.js';
import { ChangelingContractType, NwodAutocompleteParameterName } from '../../types/types.js';

export interface GetLookupContractDataOptions extends BaseLookupDataOptions
{
    name?: string | null;
    types?: [
        (ChangelingContractType | null)?,
        (ChangelingContractType | null)?,
    ];
}

@staticImplements<ChatIteractionStrategy>()
export class LookupContractStrategy
{
    public static key = NwodLookupSubcommand.Contract;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(NwodAutocompleteParameterName.ContractName);
        const type1 = interaction.options.getString('type_1') as ChangelingContractType | null;
        const type2 = interaction.options.getString('type_2') as ChangelingContractType | null;

        const keywords = await this.getLookupData({
            name,
            types: [type1, type2],
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getLookupContractsEmbedMessages(keywords);

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No contracts were found.',
        });
    }

    private static async getLookupData(input: GetLookupContractDataOptions = {
        includeAllIfNoName: true,
    }): Promise<ChangelingContract[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessNwodSpreadsheetId,
            range: `'Changeling Contracts'!A2:Z`,
        });

        const types = input.types?.reduce<ChangelingContractType[]>((acc, type) =>
        {
            if (type)
            {
                acc.push(type);
            }

            return acc;
        }, []) ?? [] as ChangelingContractType[];

        const contracts = data.reduce<ChangelingContract[]>((acc, cur) =>
        {
            // Ignore empty rows
            if (cur[0] === undefined || cur[0].trim() === '')
            {
                return acc;
            }

            const contract = new ChangelingContract(cur);

            if (contract.name === undefined || contract.name.trim() === '')
            {
                return acc;
            }

            // Name
            if (input.name && input.name.toLowerCase() !== contract.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Type
            if (types.length > 0 && !types.every(type => type && contract.types.includes(type)))
            {
                return acc;
            }

            acc.push(contract);
            return acc;
        }, []);

        // Sort by name
        contracts.sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        return contracts;
    }
}
