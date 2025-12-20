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
import { CurseborneMotif } from '../../types/CurseborneMotif.js';
import { CurseborneAutocompleteParameterName } from '../../types/types.js';
import { BaseCurseborneLookupStrategy } from './BaseCurseborneLookupStrategy.js';

export interface GetLookupMotifDataParameters extends BaseGetLookupDataParams
{
    name?: string | null;
}

@staticImplements<BaseLookupStrategy<GetLookupMotifDataParameters, CurseborneMotif>>()
export class LookupMotifStrategy extends BaseCurseborneLookupStrategy
{
    public static key: CurseborneLookupSubcommand.Motif = CurseborneLookupSubcommand.Motif;

    public static async run(
        interaction: ChatInputCommandInteraction,
    ): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(CurseborneAutocompleteParameterName.MotifName);

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
            title: 'Motifs',
            parseElementToLines: (element) => [
                Text.bold(element.name),
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
            noEmbedsErrorMessage: `No motifs were found.`,
        });
    }

    public static async getLookupData(input: GetLookupMotifDataParameters): Promise<CurseborneMotif[]>
    {
        const numOfDefinedLookupProperties = this.getNumOfDefinedLookupProperties(input);

        return await LookupStrategy.getLookupData({
            Class: CurseborneMotif,
            range: `'Motif Index'!A3:Z`,
            spreadsheetId: rollOfDarknessCurseborneSpreadsheetId,
            reduceCallback: (acc, cur) =>
            {
                const element = new CurseborneMotif(cur);

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
