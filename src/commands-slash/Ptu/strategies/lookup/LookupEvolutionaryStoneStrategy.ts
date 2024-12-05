import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { getLookupEvolutionaryStonesEmbedMessages } from '../../embed-messages/lookup.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';
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

        const evolutionaryStones = await this.getLookupData({
            name,
            pokemonToEvolve,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getLookupEvolutionaryStonesEmbedMessages(evolutionaryStones);

        return await LookupStrategy.run(interaction, embeds, {
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

        const evolutionaryStones = data.reduce<PtuEvolutionaryStone[]>((acc, cur) =>
        {
            const evolutionaryStone = new PtuEvolutionaryStone(cur);

            if (evolutionaryStone.name === undefined || evolutionaryStone.name.trim() === '')
            {
                return acc;
            }

            // Name
            if (input.name && input.name.toLowerCase() !== evolutionaryStone.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Pokemon TO Evolve
            if (input.pokemonToEvolve && !evolutionaryStone.pokemonToEvolve.includes(input.pokemonToEvolve))
            {
                return acc;
            }

            acc.push(evolutionaryStone);
            return acc;
        }, []);

        // Sort by name
        evolutionaryStones.sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        return evolutionaryStones;
    }
}
