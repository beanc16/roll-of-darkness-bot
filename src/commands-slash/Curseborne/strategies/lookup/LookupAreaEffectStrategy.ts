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
import { CurseborneAreaEffect } from '../../types/CurseborneAreaEffect.js';
import { CurseborneAreaEffectSeverity, CurseborneAutocompleteParameterName } from '../../types/types.js';
import { BaseCurseborneLookupStrategy } from './BaseCurseborneLookupStrategy.js';

export interface GetLookupAreaEffectDataParameters extends BaseGetLookupDataParams
{
    name?: string | null;
    severity?: CurseborneAreaEffectSeverity | null;
}

@staticImplements<BaseLookupStrategy<GetLookupAreaEffectDataParameters, CurseborneAreaEffect>>()
export class LookupAreaEffectStrategy extends BaseCurseborneLookupStrategy
{
    public static key: CurseborneLookupSubcommand.AreaEffect = CurseborneLookupSubcommand.AreaEffect;

    public static async run(
        interaction: ChatInputCommandInteraction,
    ): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(CurseborneAutocompleteParameterName.EdgeName);
        const severity = interaction.options.getString('severity') as CurseborneAreaEffectSeverity | null;

        // Get data
        const data = await this.getLookupData({
            name,
            severity,
            options: {
                matchType: BaseGetLookupSearchMatchType.ExactMatch,
            },
        });

        // Send message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Area Effects',
            parseElementToLines: (element) => [
                Text.bold(element.name),
                ...(element.severity !== undefined
                    ? [[
                        element.severity.length > 1 ? 'Severities' : 'Severity',
                        element.severity.join(', '),
                    ].join(': ')]
                    : []
                ),
                ...(element.effect !== undefined
                    ? [
                        `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                    ]
                    : []
                ),
                ...(element.consequence !== undefined
                    ? [
                        `Consequence:\n\`\`\`\n${element.consequence}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/cb ${CurseborneSubcommandGroup.Lookup} ${this.key}`,
            noEmbedsErrorMessage: `No area effects were found.`,
        });
    }

    public static async getLookupData(input: GetLookupAreaEffectDataParameters): Promise<CurseborneAreaEffect[]>
    {
        const numOfDefinedLookupProperties = this.getNumOfDefinedLookupProperties(input);

        return await LookupStrategy.getLookupData({
            Class: CurseborneAreaEffect,
            range: `'Area Effects Index'!A3:Z`,
            spreadsheetId: rollOfDarknessCurseborneSpreadsheetId,
            reduceCallback: (acc, cur) =>
            {
                const element = new CurseborneAreaEffect(cur);

                if (
                    numOfDefinedLookupProperties === 0
                    || this.hasMatch(input, {
                        inputValue: input.name,
                        elementValue: element.name,
                    })
                    || this.hasArrayMatch(input, {
                        inputValue: input.severity,
                        elementValue: element.severity,
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
