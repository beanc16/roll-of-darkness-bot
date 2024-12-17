import { Text } from '@beanc16/discordjs-helpers';
import { EmbedBuilder } from 'discord.js';

import { BreedPokemonShouldPickKey, BreedPokemonState } from '../models/breedPokemonStateSingleton.js';

const color = 0xCDCDCD;

export const getPokemonBreedingEmbedMessage = ({
    speciesResult,
    nature,
    ability,
    genderResult,
    shinyResult,
    inheritanceMoves,
    user,
    gm,
    userShouldPick,
    gmShouldPick,
}: BreedPokemonState): EmbedBuilder =>
{
    const genderText = ('gender' in genderResult)
        ? genderResult.gender
        : `${genderResult.roll} (if this number is lower than or matches the percentage of female pokemon of the species, it is female. Otherwise, it is male.)`;

    const propertiesUserShouldPick = Object.entries(userShouldPick).reduce<string[]>((acc, [key, val]) =>
    {
        if (val)
        {
            if (key === BreedPokemonShouldPickKey.Ability.toString())
            {
                acc.push(`${key} (pick between the species' Basic Abilities)`);
            }
            else
            {
                acc.push(key);
            }
        }

        return acc;
    }, []);

    const propertiesGmShouldPick = Object.entries(gmShouldPick).reduce<string[]>((acc, [key, val]) =>
    {
        if (val)
        {
            if (key === BreedPokemonShouldPickKey.Ability.toString())
            {
                acc.push(`${key} (pick between the species' Basic Abilities)`);
            }
            else
            {
                acc.push(key);
            }
        }
        return acc;
    }, []);

    const lines = [
        // Species
        `${Text.bold('Species')}: ${speciesResult.species} (${speciesResult.roll})`,

        // Nature
        ...(userShouldPick.Nature
            ? []
            : [`${Text.bold('Nature')}: ${nature
                ? `${nature.name} (+${nature.raisedStat}, -${nature.loweredStat})`
                : 'Pick Manually'
            }`]
        ),

        // Gender
        `${Text.bold('Gender')}: ${genderText}`,

        // Ability
        ...(!userShouldPick.Ability && !gmShouldPick.Ability && ability !== undefined
            ? [`${Text.bold('Ability')}: ${ability}`]
            : []
        ),

        // Shiny
        `${Text.bold('Shiny')}: ${shinyResult.isShiny ? 'Yes' : 'No'} (${shinyResult.roll})`,

        // Inheritance Moves
        ...(inheritanceMoves
            ? [
                `${Text.bold('Inheritance Moves')}:`,
                `\`\`\``,
                inheritanceMoves,
                `\`\`\``,
            ]
            : [
                `${Text.bold('Inheritance Moves')}:`,
                `(any moves on the child species' egg or tm move lists that either parent knows)`,
                '',
            ]
        ),

        // Things the user should pick
        ...(propertiesUserShouldPick.length > 0
            ? [
                `${Text.Ping.user(user.id)} should pick:`,
                ...propertiesUserShouldPick,
                ...(propertiesGmShouldPick.length > 0 ? [''] : []),
            ]
            : []
        ),

        // Things the GM should pick
        ...(propertiesGmShouldPick.length > 0
            ? [
                `${Text.Ping.user(gm.id)} should pick:`,
                ...propertiesGmShouldPick,
            ]
            : []
        ),
    ];

    const embed = new EmbedBuilder()
        .setTitle('Pokemon Breeding')
        .setDescription(
            lines.join('\n'),
        )
        .setColor(color);

    return embed;
};
