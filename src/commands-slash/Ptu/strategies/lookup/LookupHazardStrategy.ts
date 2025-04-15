import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { PtuHazard } from '../../types/PtuHazard.js';
import type { PtuLookupIteractionStrategy } from '../../types/strategies.js';

export interface GetLookupHazardDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
    moveName?: string | null;
    abilityName?: string | null;
}

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupHazardStrategy
{
    public static key: PtuLookupSubcommand.Hazard = PtuLookupSubcommand.Hazard;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.HazardName);
        const moveName = interaction.options.getString(PtuAutocompleteParameterName.MoveName);
        const abilityName = interaction.options.getString(PtuAutocompleteParameterName.AbilityName);

        const data = await this.getLookupData({
            name,
            moveName,
            abilityName,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Hazards',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.associatedMoves !== undefined && element.associatedMoves.length > 0
                    ? [
                        `Asssociated Moves: ${element.associatedMoves.join(', ')}`,
                    ]
                    : []
                ),
                ...(element.associatedAbilities !== undefined && element.associatedAbilities.length > 0
                    ? [
                        `Asssociated Abilities: ${element.associatedAbilities.join(', ')}`,
                    ]
                    : []
                ),
                ...(element.description !== undefined && element.description !== '--'
                    ? [
                        `Description:\n\`\`\`\n${element.description}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${this.key}`,
            noEmbedsErrorMessage: 'No hazards were found.',
        });
    }

    public static async getLookupData(input: GetLookupHazardDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuHazard[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Hazard,
        });

        const output = data.reduce<PtuHazard[]>((acc, cur) =>
        {
            const element = new PtuHazard(cur);

            // cur[0] === name in spreadsheet
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Move
            if (input.moveName && !element.associatedMoves?.some(move => move.toLowerCase() === input.moveName?.toLowerCase()))
            {
                return acc;
            }

            // Ability
            if (input.abilityName && !element.associatedAbilities?.some(ability => ability.toLowerCase() === input.abilityName?.toLowerCase()))
            {
                return acc;
            }

            acc.push(element);
            return acc;
        }, []);

        // Sort by name
        output.sort((a, b) => a.name.localeCompare(b.name));

        return output;
    }
}
