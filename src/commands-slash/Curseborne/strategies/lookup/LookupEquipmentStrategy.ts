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
import { CurseborneEquipment } from '../../types/CurseborneEquipment.js';
import { CurseborneAutocompleteParameterName, CurseborneEquipmentType } from '../../types/types.js';
import { BaseCurseborneLookupStrategy } from './BaseCurseborneLookupStrategy.js';

export interface GetLookupEquipmentDataParameters extends BaseGetLookupDataParams
{
    name?: string | null;
    type?: CurseborneEquipmentType | null;
    tag?: string | null;
}

@staticImplements<BaseLookupStrategy<GetLookupEquipmentDataParameters, CurseborneEquipment>>()
export class LookupEquipmentStrategy extends BaseCurseborneLookupStrategy
{
    public static key: CurseborneLookupSubcommand.Equipment = CurseborneLookupSubcommand.Equipment;

    public static async run(
        interaction: ChatInputCommandInteraction,
    ): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(CurseborneAutocompleteParameterName.EquipmentName);
        const type = interaction.options.getString('type') as CurseborneEquipmentType | null;
        const tag = interaction.options.getString(CurseborneAutocompleteParameterName.EquipmentTag);

        // Get data
        const data = await this.getLookupData({
            name,
            type,
            tag,
            options: {
                matchType: BaseGetLookupSearchMatchType.ExactMatch,
            },
        });

        // Send message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Tricks',
            parseElementToLines: (element) => [
                Text.bold(element.name),
                ...(element.type !== undefined
                    ? [`Type: ${element.type}`]
                    : []
                ),
                ...(element.tags !== undefined
                    ? [[
                        element.tags.length > 1 ? 'Tags' : 'Tag',
                        element.tags.join(', '),
                    ].join(': ')]
                    : []
                ),
                ...(element.description !== undefined
                    ? [
                        `Description:\n\`\`\`\n${element.description}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/cb ${CurseborneSubcommandGroup.Lookup} ${this.key}`,
            noEmbedsErrorMessage: `No equipment was found.`,
        });
    }

    public static async getLookupData(input: GetLookupEquipmentDataParameters): Promise<CurseborneEquipment[]>
    {
        const numOfDefinedLookupProperties = this.getNumOfDefinedLookupProperties(input);

        return await LookupStrategy.getLookupData({
            Class: CurseborneEquipment,
            range: `'Equipment Index'!A3:Z`,
            spreadsheetId: rollOfDarknessCurseborneSpreadsheetId,
            reduceCallback: (acc, cur) =>
            {
                const element = new CurseborneEquipment(cur);

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
                    || this.hasArrayMatch(input, {
                        inputValue: input.tag,
                        elementValue: element.tags,
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
