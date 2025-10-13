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
import { CurseborneSpell } from '../../types/CurseborneSpell.js';
import { CurseborneAutocompleteParameterName } from '../../types/types.js';
import { BaseCurseborneLookupStrategy } from './BaseCurseborneLookupStrategy.js';

export interface GetLookupSpellDataParameters extends BaseGetLookupDataParams
{
    name?: string | null;
    spellAvailableTo?: string | null;
}

@staticImplements<BaseLookupStrategy<GetLookupSpellDataParameters, CurseborneSpell>>()
export class LookupSpellStrategy extends BaseCurseborneLookupStrategy
{
    public static key: CurseborneLookupSubcommand.Spell = CurseborneLookupSubcommand.Spell;

    public static async run(
        interaction: ChatInputCommandInteraction,
    ): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(CurseborneAutocompleteParameterName.SpellName);
        const spellAvailableTo = interaction.options.getString(CurseborneAutocompleteParameterName.SpellAvailableTo);

        // Get data
        const data = await this.getLookupData({
            name,
            spellAvailableTo,
            options: {
                matchType: BaseGetLookupSearchMatchType.ExactMatch,
            },
        });

        // Send message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Spells',
            parseElementToLines: (element) => [
                Text.bold(element.name),
                ...(element.availableTo !== undefined
                    ? [[
                        'Available To',
                        element.availableTo.join(', '),
                    ].join(': ')]
                    : []
                ),
                ...(element.cost !== undefined
                    ? [`Cost: ${element.cost}`]
                    : []
                ),
                ...(element.types !== undefined
                    ? [[
                        element.types.length > 1 ? 'Types' : 'Type',
                        element.types.join(', '),
                    ].join(': ')]
                    : []
                ),
                ...(element.attunements !== undefined
                    ? [[
                        element.attunements.length > 1 ? 'Attunements' : 'Attunement',
                        element.attunements.join(', '),
                    ].join(': ')]
                    : []
                ),
                ...(element.effect !== undefined
                    ? [
                        `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                    ]
                    : []
                ),
                ...(element.advanceNames !== undefined
                    ? [[
                        element.advanceNames.length > 1 ? 'Advance Names' : 'Advance Name',
                        Text.Code.multiLine(`${element.advanceNames.join('\n')}`),
                    ].join(': ')]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/cb ${CurseborneSubcommandGroup.Lookup} ${this.key}`,
            noEmbedsErrorMessage: `No spells were found.`,
        });
    }

    public static async getLookupData(input: GetLookupSpellDataParameters): Promise<CurseborneSpell[]>
    {
        const numOfDefinedLookupProperties = this.getNumOfDefinedLookupProperties(input);

        return await LookupStrategy.getLookupData({
            Class: CurseborneSpell,
            range: `'Spells Index'!A3:Z`,
            spreadsheetId: rollOfDarknessCurseborneSpreadsheetId,
            reduceCallback: (acc, cur) =>
            {
                const element = new CurseborneSpell(cur);

                if (
                    numOfDefinedLookupProperties === 0
                    || this.hasMatch(input, {
                        inputValue: input.name,
                        elementValue: element.name,
                    })
                    || this.hasArrayMatch(input, {
                        inputValue: input.spellAvailableTo,
                        elementValue: element.availableTo,
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
