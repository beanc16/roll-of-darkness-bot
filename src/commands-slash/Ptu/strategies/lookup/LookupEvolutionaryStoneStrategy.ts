import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { PtuEvolutionaryStone } from '../../types/PtuEvolutionaryStone.js';

export interface GetLookupEvolutionaryStoneDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
    pokemonToEvolve?: string | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupEvolutionaryStoneStrategy
{
    public static key = PtuLookupSubcommand.EvolutionaryStone;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.EvolutionaryStone);
        const pokemonToEvolve = interaction.options.getString(PtuAutocompleteParameterName.PokemonToEvolve);

        const data = await this.getLookupData({
            name,
            pokemonToEvolve,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Evolutionary Stones',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.cost !== undefined
                    ? [`Cost: ${element.cost}`]
                    : []
                ),
                ...(element.pokemonToEvolve !== undefined && element.pokemonToEvolve.length > 0
                    ? [
                        `Evolves:\n\`\`\`\n${element.pokemonToEvolve.join('\n')}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.EvolutionaryStone}`,
            noEmbedsErrorMessage: 'No evolutionary stones were found.',
        });
    }

    private static async getLookupData(input: GetLookupEvolutionaryStoneDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuEvolutionaryStone[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.EvolutionaryStone,
        });

        const output = data.reduce<PtuEvolutionaryStone[]>((acc, cur) =>
        {
            const element = new PtuEvolutionaryStone(cur);

            if (element.name === undefined || element.name.trim() === '')
            {
                return acc;
            }

            // Name
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Pokemon TO Evolve
            if (input.pokemonToEvolve && !element.pokemonToEvolve.includes(input.pokemonToEvolve))
            {
                return acc;
            }

            acc.push(element);
            return acc;
        }, []);

        // Sort by name
        output.sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        return output;
    }
}
