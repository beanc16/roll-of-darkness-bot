import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { getLookupPokeballsEmbedMessages } from '../../embed-messages/lookup.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';
import { PokeballType } from '../../types/pokeballType.js';
import { PtuPokeball } from '../../types/PtuPokeball.js';

export interface GetLookupPokeballDataParameters
{
    name?: string | null;
    type?: PokeballType | null;
    includeAllIfNoName?: boolean;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupPokeballStrategy
{
    public static key = PtuLookupSubcommand.Pokeball;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString('pokeball_name');
        const type = interaction.options.getString('type') as PokeballType | null;

        const pokeballs = await this.getLookupData({
            name,
            type,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getLookupPokeballsEmbedMessages(pokeballs);

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No pokeballs were found.',
        });
    }

    private static async getLookupData(input: GetLookupPokeballDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuPokeball[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'Pokeball Data'!A2:Z`,
        });

        const pokeballs = data.reduce<PtuPokeball[]>((acc, cur) =>
        {
            const pokeball = new PtuPokeball(cur);

            if (pokeball.name === undefined || pokeball.name.trim() === '')
            {
                return acc;
            }

            // Name
            if (input.name && input.name.toLowerCase() !== pokeball.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Type
            if (input.type && input.type !== pokeball.type)
            {
                return acc;
            }

            acc.push(pokeball);
            return acc;
        }, []);

        // Sort by name
        pokeballs.sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        return pokeballs;
    }
}
