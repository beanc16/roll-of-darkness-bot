import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { getPagedEmbedMessages } from '../../../shared/embed-messages/shared.js';
import {
    BaseGetLookupDataParams,
    BaseGetLookupSearchMatchType,
    BaseLookupStrategy,
    LookupStrategy,
} from '../../../strategies/BaseLookupStrategy.js';
import { rollOfDarknessCurseborneSpreadsheetId } from '../../constants.js';
import { CurseborneSubcommandGroup } from '../../options/index.js';
import { CurseborneLookupSubcommand } from '../../options/lookup.js';
import { CurseborneTag } from '../../types/CurseborneTag.js';
import { CurseborneAutocompleteParameterName, CurseborneTagType } from '../../types/types.js';
import { BaseCurseborneLookupStrategy } from './BaseCurseborneLookupStrategy.js';

export interface GetLookupTagDataParameters extends BaseGetLookupDataParams
{
    name?: string | null;
    type?: CurseborneTagType | null;
}

@staticImplements<BaseLookupStrategy<GetLookupTagDataParameters, CurseborneTag>>()
export class LookupTagStrategy extends BaseCurseborneLookupStrategy
{
    public static key: CurseborneLookupSubcommand.Tag = CurseborneLookupSubcommand.Tag;

    public static async run(
        interaction: ChatInputCommandInteraction,
    ): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(CurseborneAutocompleteParameterName.EdgeName);
        const type = interaction.options.getString('type') as CurseborneTagType | null;

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
            title: 'Tags',
            parseElementToLines: (element) => [
                Text.bold(element.name),
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
            commandName: `/cb ${CurseborneSubcommandGroup.Lookup} ${this.key}`,
            noEmbedsErrorMessage: `No tags were found.`,
        });
    }

    public static async getLookupData(input: GetLookupTagDataParameters): Promise<CurseborneTag[]>
    {
        const numOfDefinedLookupProperties = this.getNumOfDefinedLookupProperties(input);

        return await LookupStrategy.getLookupData({
            Class: CurseborneTag,
            range: `'Tag Index'!A3:Z`,
            spreadsheetId: rollOfDarknessCurseborneSpreadsheetId,
            reduceCallback: (acc, cur) =>
            {
                const element = new CurseborneTag(cur);

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
