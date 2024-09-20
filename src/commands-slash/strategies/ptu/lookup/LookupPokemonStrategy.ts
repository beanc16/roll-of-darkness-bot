import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuLookupSubcommand } from '../../../options/subcommand-groups/ptu/lookup.js';

import { getLookupPokemonEmbedMessages } from '../../../embed-messages/ptu/lookup.js';
import { BaseLookupRespondStrategy } from './BaseLookupRespondStrategy.js';
import { PokemonController } from '../../../../dal/PtuController.js';
import { PokeApi } from '../../../../services/PokeApi.js';
import { PtuPokemon } from '../../../../types/pokemon.js';

export enum PtuPokemonLookupType
{
    SubstringCaseInsensitive = 'SUBSTRING_CASE_INSENSITIVE',
    ExactMatch = 'EXACT_MATCH',
}

export interface GetLookupPokemonDataParameters
{
    name?: string | null;
    lookupType?: PtuPokemonLookupType;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupPokemonStrategy
{
    public static key = PtuLookupSubcommand.Pokemon;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString('pokemon_name', true);

        const pokemon = await this.getLookupData({
            name,
            lookupType: PtuPokemonLookupType.ExactMatch,
        });

        // TODO: Add listview and final paginated functionality later

        // Get message
        const embeds = getLookupPokemonEmbedMessages(pokemon);

        return await BaseLookupRespondStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No pokemon were found.',
        });
    }

    public static async getLookupData({
        name,
        lookupType = PtuPokemonLookupType.SubstringCaseInsensitive,
    }: GetLookupPokemonDataParameters = {})
    {
        if (!name)
        {
            return [];
        }

        const lookupName = (lookupType === PtuPokemonLookupType.SubstringCaseInsensitive)
            ? new RegExp(escapeRegex(name), 'i')
            : name;

        const { results = [] } = await PokemonController.getAll({
            name: lookupName,
        });

        const dexNumbers = results.map(({
            metadata: {
                dexNumber,
            },
        }: PtuPokemon) => dexNumber);

        // Only include image urls for exact match searching
        const imageUrlResults = (lookupType === PtuPokemonLookupType.ExactMatch)
            ? await PokeApi.getImageUrls(dexNumbers)
            : undefined;

        // Try to add imageUrl to pokemon result
        const pokemon = results.map((result: PtuPokemon) => {
            const {
                metadata: {
                    dexNumber,
                },
            } = result;

            const { imageUrl } = imageUrlResults?.find(({ id }) =>
                id === PokeApi.parseId(dexNumber)
            ) ?? {};

            if (!imageUrl)
            {
                return result;
            }

            return {
                ...result,
                metadata: {
                    ...result.metadata,
                    imageUrl,
                },
            } as PtuPokemon;
        }) as PtuPokemon[];

        // Sort by name
        pokemon.sort((a, b) =>
        {
            return a.name.localeCompare(b.name);
        });

        return pokemon;
    }
}

const escapeRegex = (string: string) =>
{
    return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}
