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
import { CurseborneTrick } from '../../types/CurseborneTrick.js';
import { CurseborneAutocompleteParameterName } from '../../types/types.js';
import { BaseCurseborneLookupStrategy } from './BaseCurseborneLookupStrategy.js';

export interface GetLookupTrickDataParameters extends BaseGetLookupDataParams
{
    name?: string | null;
}

@staticImplements<BaseLookupStrategy<GetLookupTrickDataParameters, CurseborneTrick>>()
export class LookupTrickStrategy extends BaseCurseborneLookupStrategy
{
    public static key: CurseborneLookupSubcommand.Trick = CurseborneLookupSubcommand.Trick;

    public static async run(
        interaction: ChatInputCommandInteraction,
    ): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(CurseborneAutocompleteParameterName.TrickName, true);

        // Get data
        const data = await this.getLookupData({
            name,
            options: {
                matchType: BaseGetLookupSearchMatchType.ExactMatch,
            },
        });

        // Send message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Tricks',
            parseElementToLines: ({ formattedDescription }) => [formattedDescription],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/cb ${CurseborneSubcommandGroup.Lookup} ${CurseborneLookupSubcommand.Trick}`,
            noEmbedsErrorMessage: `No tricks were found.`,
        });
    }

    public static async getLookupData(input: GetLookupTrickDataParameters): Promise<CurseborneTrick[]>
    {
        const numOfDefinedLookupProperties = this.getNumOfDefinedLookupProperties(input);

        return await LookupStrategy.getLookupData({
            Class: CurseborneTrick,
            range: `'Tricks Data'!A2:Z`,
            spreadsheetId: rollOfDarknessCurseborneSpreadsheetId,
            reduceCallback: (acc, cur) =>
            {
                const element = new CurseborneTrick(cur);

                if (
                    numOfDefinedLookupProperties === 0
                    || this.hasMatch(input, {
                        inputValue: input.name,
                        elementValue: element.name,
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
