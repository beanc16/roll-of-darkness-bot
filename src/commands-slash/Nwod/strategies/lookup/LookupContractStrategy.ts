import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../shared/embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessNwodSpreadsheetId } from '../../constants.js';
import { NwodSubcommandGroup } from '../../options/index.js';
import { NwodLookupSubcommand } from '../../options/lookup.js';
import { ChangelingContract } from '../../types/ChangelingContract.js';
import { NwodAutocompleteParameterName, NwodLookupRange } from '../../types/lookup.js';
import { ChangelingContractType } from '../../types/types.js';

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

        const data = await this.getLookupData({
            name,
            types: [type1, type2],
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Contracts',
            parseElementToLines: element => [
                `${Text.bold(element.name)}`,
                ...(element.types !== undefined
                    ? [[
                        element.types.length > 1 ? 'Types' : 'Type',
                        element.types.join(', '),
                    ].join(': ')]
                    : []
                ),
                ...(element.cost !== undefined
                    ? [`Cost: ${element.cost}`]
                    : []
                ),
                ...(element.activationRoll !== undefined
                    ? [`Activation Roll: ${element.activationRoll}`]
                    : []
                ),
                ...(element.action !== undefined
                    ? [`Action: ${element.action}`]
                    : []
                ),
                ...(element.duration !== undefined
                    ? [`Duration: ${element.duration}`]
                    : []
                ),
                ...(element.pageNumber !== undefined
                    ? [`Page Number: ${element.pageNumber}`]
                    : []
                ),
                ...(element.loophole !== undefined && element.loophole !== '--'
                    ? [
                        `Loophole:\n\`\`\`\n${element.loophole}\`\`\``,
                    ]
                    : []
                ),
                ...(element.description !== undefined && element.description !== '--'
                    ? [
                        `Description:\n\`\`\`\n${element.description}\`\`\``,
                    ]
                    : []
                ),
                ...(element.seemingBenefits !== undefined && element.seemingBenefits !== '--'
                    ? [
                        `Seeming Benefits:\n\`\`\`\n${element.seemingBenefits}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/nwod ${NwodSubcommandGroup.Lookup} ${NwodLookupSubcommand.Contract}`,
            noEmbedsErrorMessage: 'No contracts were found.',
        });
    }

    private static async getLookupData(input: GetLookupContractDataOptions = {
        includeAllIfNoName: true,
    }): Promise<ChangelingContract[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessNwodSpreadsheetId,
            range: NwodLookupRange.Contract,
        });

        const types = input.types?.reduce<ChangelingContractType[]>((acc, type) =>
        {
            if (type)
            {
                acc.push(type);
            }

            return acc;
        }, []) ?? [] as ChangelingContractType[];

        const output = data.reduce<ChangelingContract[]>((acc, cur) =>
        {
            // Ignore empty rows
            if (cur[0] === undefined || cur[0].trim() === '')
            {
                return acc;
            }

            const element = new ChangelingContract(cur);

            if (element.name === undefined || element.name.trim() === '')
            {
                return acc;
            }

            // Name
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Type
            if (types.length > 0 && !types.every(type => type && element.types.includes(type)))
            {
                return acc;
            }

            acc.push(element);
            return acc;
        }, []);

        // Sort by name
        output.sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        return output;
    }
}
