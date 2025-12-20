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
import { CurseborneArtifact } from '../../types/CurseborneArtifact.js';
import { CurseborneAutocompleteParameterName } from '../../types/types.js';
import { BaseCurseborneLookupStrategy } from './BaseCurseborneLookupStrategy.js';

export interface GetLookupArtifactDataParameters extends BaseGetLookupDataParams
{
    name?: string | null;
}

@staticImplements<BaseLookupStrategy<GetLookupArtifactDataParameters, CurseborneArtifact>>()
export class LookupArtifactStrategy extends BaseCurseborneLookupStrategy
{
    public static key: CurseborneLookupSubcommand.Artifact = CurseborneLookupSubcommand.Artifact;

    public static async run(
        interaction: ChatInputCommandInteraction,
    ): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(CurseborneAutocompleteParameterName.Artifact);

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
            title: 'Artifacts',
            parseElementToLines: (element) => [
                Text.bold(element.name),
                ...(element.dots !== undefined
                    ? [`Dots: ${element.dots}`]
                    : []
                ),
                ...(element.effect !== undefined
                    ? [
                        `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                    ]
                    : []
                ),
                ...(element.special !== undefined
                    ? [
                        `Special:\n\`\`\`\n${element.special}\`\`\``,
                    ]
                    : []
                ),
                ...(element.obligation !== undefined
                    ? [
                        `Obligation:\n\`\`\`\n${element.obligation}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/cb ${CurseborneSubcommandGroup.Lookup} ${this.key}`,
            noEmbedsErrorMessage: `No artifacts were found.`,
        });
    }

    public static async getLookupData(input: GetLookupArtifactDataParameters): Promise<CurseborneArtifact[]>
    {
        const numOfDefinedLookupProperties = this.getNumOfDefinedLookupProperties(input);

        return await LookupStrategy.getLookupData({
            Class: CurseborneArtifact,
            range: `'Artifacts Index'!A3:Z`,
            spreadsheetId: rollOfDarknessCurseborneSpreadsheetId,
            reduceCallback: (acc, cur) =>
            {
                const element = new CurseborneArtifact(cur);

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
