import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';

import { BreedPokemonShouldPickKey, BreedPokemonState } from '../models/breedPokemonStateSingleton.js';

/* istanbul ignore next */
export const getBreedPokemonUpdatablesButtonRowComponent = ({ userShouldPick, gmShouldPick }: Pick<BreedPokemonState, 'userShouldPick' | 'gmShouldPick'>): ActionRowBuilder<ButtonBuilder> =>
{
    const keys = new Set<BreedPokemonShouldPickKey>([
        ...Object.keys(userShouldPick),
        ...Object.keys(gmShouldPick),
    ] as BreedPokemonShouldPickKey[]);

    const row = new ActionRowBuilder<ButtonBuilder>();

    keys.forEach((key) =>
    {
        const userTypedKey = key as Exclude<BreedPokemonShouldPickKey, BreedPokemonShouldPickKey.Shiny>;
        const gmTypedKey = key as Exclude<BreedPokemonShouldPickKey, BreedPokemonShouldPickKey.Nature | BreedPokemonShouldPickKey.Shiny>;

        if (userShouldPick[userTypedKey] || gmShouldPick[gmTypedKey])
        {
            const button = new ButtonBuilder({
                customId: key,
                label: `Add ${key}`,
                style: ButtonStyle.Secondary,
            });

            row.addComponents(button);
        }
    });

    return row;
};
