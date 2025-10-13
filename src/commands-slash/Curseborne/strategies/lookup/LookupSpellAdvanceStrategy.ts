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
import { CurseborneSpellAdvance } from '../../types/CurseborneSpellAdvance.js';
import { CurseborneAutocompleteParameterName } from '../../types/types.js';
import { BaseCurseborneLookupStrategy } from './BaseCurseborneLookupStrategy.js';

export interface GetLookupSpellAdvanceDataParameters extends BaseGetLookupDataParams
{
    name?: string | null;
    spellName?: string | null;
}

@staticImplements<BaseLookupStrategy<GetLookupSpellAdvanceDataParameters, CurseborneSpellAdvance>>()
export class LookupSpellAdvanceStrategy extends BaseCurseborneLookupStrategy
{
    public static key: CurseborneLookupSubcommand.SpellAdvance = CurseborneLookupSubcommand.SpellAdvance;

    public static async run(
        interaction: ChatInputCommandInteraction,
    ): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(CurseborneAutocompleteParameterName.SpellAdvanceName);
        const spellName = interaction.options.getString(CurseborneAutocompleteParameterName.SpellName);

        // Get data
        const data = await this.getLookupData({
            name,
            spellName,
            options: {
                matchType: BaseGetLookupSearchMatchType.ExactMatch,
            },
        });

        // Send message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Spell Advances',
            parseElementToLines: (element) => [
                Text.bold(element.name),
                ...(element.prerequisites !== undefined
                    ? [[
                        element.prerequisites.length > 1 ? 'Prerequisites' : 'Prerequisite',
                        element.prerequisites.join(', '),
                    ].join(': ')]
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
            noEmbedsErrorMessage: `No spell advances were found.`,
        });
    }

    public static async getLookupData(input: GetLookupSpellAdvanceDataParameters): Promise<CurseborneSpellAdvance[]>
    {
        const numOfDefinedLookupProperties = this.getNumOfDefinedLookupProperties(input);

        return await LookupStrategy.getLookupData({
            Class: CurseborneSpellAdvance,
            range: `'Spell Advance Index'!A3:Z`,
            spreadsheetId: rollOfDarknessCurseborneSpreadsheetId,
            reduceCallback: (acc, cur) =>
            {
                const element = new CurseborneSpellAdvance(cur);

                if (
                    numOfDefinedLookupProperties === 0
                    || this.hasMatch(input, {
                        inputValue: input.name,
                        elementValue: element.name,
                    })
                    || this.hasArrayMatch(input, {
                        inputValue: input.spellName,
                        elementValue: element.prerequisites,
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
