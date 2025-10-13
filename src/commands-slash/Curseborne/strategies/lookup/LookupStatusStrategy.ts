import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import {
    BaseGetLookupDataParams,
    BaseGetLookupSearchMatchType,
    BaseLookupStrategy,
    LookupStrategy,
} from '../../../strategies/BaseLookupStrategy.js';
import { rollOfDarknessCurseborneSpreadsheetId } from '../../constants.js';
import { CurseborneSubcommandGroup } from '../../options/index.js';
import { CurseborneLookupSubcommand } from '../../options/lookup.js';
import { CurseborneStatus } from '../../types/CurseborneStatus.js';
import { CurseborneAutocompleteParameterName, CurseborneStatusType } from '../../types/types.js';
import { BaseCurseborneLookupStrategy } from './BaseCurseborneLookupStrategy.js';

export interface GetLookupStatusDataParameters extends BaseGetLookupDataParams
{
    name?: string | null;
    type?: CurseborneStatusType | null;
}

@staticImplements<BaseLookupStrategy<GetLookupStatusDataParameters, CurseborneStatus>>()
export class LookupStatusStrategy extends BaseCurseborneLookupStrategy
{
    public static key: CurseborneLookupSubcommand.Status = CurseborneLookupSubcommand.Status;

    public static async run(
        interaction: ChatInputCommandInteraction,
    ): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(CurseborneAutocompleteParameterName.StatusName);
        const type = interaction.options.getString('type') as CurseborneStatusType | null;

        // Get data
        const data = await this.getLookupData({
            name,
            type,
            options: {
                matchType: BaseGetLookupSearchMatchType.ExactMatch,
            },
        });

        // Send message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Statuses',
            parseElementToLines: (element) => [
                Text.bold(element.name),
                ...(element.types !== undefined
                    ? [[
                        element.types.length > 1 ? 'Types' : 'Type',
                        element.types.join(', '),
                    ].join(': ')]
                    : []
                ),
                ...(element.effect !== undefined
                    ? [
                        `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                    ]
                    : []
                ),
                ...(element.resolution !== undefined
                    ? [
                        `Resolution:\n\`\`\`\n${element.resolution}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/cb ${CurseborneSubcommandGroup.Lookup} ${this.key}`,
            noEmbedsErrorMessage: `No statuses were found.`,
        });
    }

    public static async getLookupData(input: GetLookupStatusDataParameters): Promise<CurseborneStatus[]>
    {
        const numOfDefinedLookupProperties = this.getNumOfDefinedLookupProperties(input);

        return await LookupStrategy.getLookupData({
            Class: CurseborneStatus,
            range: `'Status Index'!A3:Z`,
            spreadsheetId: rollOfDarknessCurseborneSpreadsheetId,
            reduceCallback: (acc, cur) =>
            {
                const element = new CurseborneStatus(cur);

                if (
                    numOfDefinedLookupProperties === 0
                    || this.hasMatch(input, {
                        inputValue: input.name,
                        elementValue: element.name,
                    })
                    || this.hasArrayMatch(input, {
                        inputValue: input.type,
                        elementValue: element.types,
                    })
                    || (
                        input.type === CurseborneStatusType.None
                        && element.types?.[0] === undefined
                    )
                )
                {
                    acc.push(element);
                }

                return acc;
            },
        });
    }
}
