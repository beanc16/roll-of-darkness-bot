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
import { CurseborneEdge } from '../../types/CurseborneEdge.js';
import { CurseborneAutocompleteParameterName, CurseborneEdgeType } from '../../types/types.js';
import { BaseCurseborneLookupStrategy } from './BaseCurseborneLookupStrategy.js';

export interface GetLookupEdgeDataParameters extends BaseGetLookupDataParams
{
    name?: string | null;
    type?: CurseborneEdgeType | null;
}

@staticImplements<BaseLookupStrategy<GetLookupEdgeDataParameters, CurseborneEdge>>()
export class LookupEdgeStrategy extends BaseCurseborneLookupStrategy
{
    public static key: CurseborneLookupSubcommand.Edge = CurseborneLookupSubcommand.Edge;

    public static async run(
        interaction: ChatInputCommandInteraction,
    ): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(CurseborneAutocompleteParameterName.EdgeName);
        const type = interaction.options.getString('type') as CurseborneEdgeType | null;

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
            title: 'Tricks',
            parseElementToLines: (element) => [
                `${Text.bold(element.name)} (${element.dotsAvailable})`,
                ...(element.prerequisites !== undefined
                    ? [[
                        element.prerequisites.length > 1 ? 'Prerequisites' : 'Prerequisite',
                        element.prerequisites.join(', '),
                    ].join(': ')]
                    : []
                ),
                ...(element.type !== undefined
                    ? [`Type: ${element.type}`]
                    : []
                ),
                ...(element.effect !== undefined
                    ? [
                        `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/cb ${CurseborneSubcommandGroup.Lookup} ${CurseborneLookupSubcommand.Trick}`,
            noEmbedsErrorMessage: `No tricks were found.`,
        });
    }

    public static async getLookupData(input: GetLookupEdgeDataParameters): Promise<CurseborneEdge[]>
    {
        const numOfDefinedLookupProperties = this.getNumOfDefinedLookupProperties(input);

        return await LookupStrategy.getLookupData({
            Class: CurseborneEdge,
            range: `'Edges Index'!A3:Z`,
            spreadsheetId: rollOfDarknessCurseborneSpreadsheetId,
            reduceCallback: (acc, cur) =>
            {
                const element = new CurseborneEdge(cur);

                if (
                    numOfDefinedLookupProperties === 0
                    || this.hasMatch(input, {
                        inputValue: input.name,
                        elementValue: element.name,
                    })
                    || this.hasMatch(input, {
                        inputValue: input.type,
                        elementValue: element.type,
                    })
                )
                {
                    acc.push(element);
                }

                return acc;
            },
        });
    }
}
