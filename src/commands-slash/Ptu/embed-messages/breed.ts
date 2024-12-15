import { Text } from '@beanc16/discordjs-helpers';
import { EmbedBuilder, type User } from 'discord.js';

import {
    GetGenderResult,
    RollShinyResult,
    RollSpeciesResult,
} from '../types/breed.js';
import { PtuNature } from '../types/PtuNature.js';

const color = 0xCDCDCD;

export const getPokemonBreedingEmbedMessage = ({
    speciesResult,
    nature,
    ability,
    shouldPickAbilityManually,
    genderResult,
    shinyResult,
    inheritanceMoves,
    user,
    gm,
}: {
    speciesResult: RollSpeciesResult;
    nature: PtuNature | undefined;
    ability?: string;
    shouldPickAbilityManually: boolean;
    genderResult: GetGenderResult;
    shinyResult: RollShinyResult;
    inheritanceMoves?: string;
    user: User;
    gm: User;
}): EmbedBuilder =>
{
    const genderText = ('gender' in genderResult)
        ? genderResult.gender
        : `${genderResult.roll} (if this number is lower than or matches the percentage of female pokemon of the species, it is female. Otherwise, it is male.)`;

    const userShouldPick = {
        Nature: nature === undefined,
        Ability: shouldPickAbilityManually && ability === undefined,
    };
    const propertiesUserShouldPick = Object.entries(userShouldPick).reduce<string[]>((acc, [key, val]) =>
    {
        if (val)
        {
            acc.push(key);
        }
        return acc;
    }, []);

    const gmShouldPick = {
        Ability: !shouldPickAbilityManually && ability === undefined,
        Shiny: shinyResult.isShiny,
    };
    const propertiesGmShouldPick = Object.entries(gmShouldPick).reduce<string[]>((acc, [key, val]) =>
    {
        if (val)
        {
            acc.push(key);
        }
        return acc;
    }, []);

    const lines = [
        // Species
        `${Text.bold('Species')}: ${speciesResult.species} (${speciesResult.roll})`,

        // Nature
        ...(userShouldPick.Nature
            ? []
            : [`${Text.bold('Nature')}: ${nature?.name ?? 'Pick Manually'}`]
        ),

        // Gender
        `${Text.bold('Gender')}: ${genderText}`,

        // Ability
        ...(userShouldPick.Ability && ability !== undefined
            ? [`${Text.bold('Ability')}: ${ability}`]
            : []
        ),

        // Shiny
        `${Text.bold('Shiny')}: ${shinyResult.isShiny ? 'Yes' : 'No'} (${shinyResult.roll})`,

        // Inheritance Moves
        ...(inheritanceMoves !== undefined
            ? [`${Text.bold('Inheritance Moves')}:\n\`\`\`\n${inheritanceMoves}\n\`\`\``]
            : []
        ),

        // Line break
        '',

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
