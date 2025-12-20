import { Text } from '@beanc16/discordjs-helpers';
import { EmbedBuilder } from 'discord.js';

import { capitalizeFirstLetter } from '../../../services/stringHelpers/stringHelpers.js';
import { createEmbedMessageDescriptionAndPage, getPagedEmbedBuilders } from '../../shared/embed-messages/shared.js';
import { PokemonTypePossibility, TypeEffectivenessRole } from '../services/PokemonTypeEffectivenessService/PokemonTypeEffectivenessService.js';
import { PokemonTypeAndNone } from '../types/pokemon.js';
import { PtuAbilityForTypeEffectiveness } from '../types/PtuAbilityForTypeEffectiveness.js';

export const getTypeEffectivenessEmbedMessages = ({
    typeEffectivenessToTypes,
    role,
    inputTypes,
    inputAbilities,
}: {
    typeEffectivenessToTypes: Record<string, PokemonTypePossibility[]>;
    inputAbilities: PtuAbilityForTypeEffectiveness[];
    role: TypeEffectivenessRole;
    inputTypes: PokemonTypeAndNone[];
}): EmbedBuilder[] =>
{
    // Get keys from highest to lowest
    const keys = Object.keys(typeEffectivenessToTypes).sort((a, b) => b.localeCompare(a));

    // Exit early if no keys are found
    if (keys.length === 0) return [];

    // Get prefix and suffix
    const roleToHeaderPrefix: Record<TypeEffectivenessRole, { prefix: string; suffix: string }> = {
        [TypeEffectivenessRole.Offensive]: {
            prefix: 'Deals',
            suffix: 'to',
        },
        [TypeEffectivenessRole.Defensive]: {
            prefix: 'Takes',
            suffix: 'from',
        },
    };
    const { prefix, suffix } = roleToHeaderPrefix[role];

    const abilitiesString = (inputAbilities.length > 0)
        ? `\nWith: ${inputAbilities.join(', ')}`
        : '';

    // Set initial value
    const initialString = `${Text.bold(`For: ${inputTypes.join(', ')}`)}${abilitiesString}\n\n`;

    // Get pages
    const { pages } = keys.reduce((pageData, typeEffectiveness, index) =>
    {
        // Get the value for the corresponding key
        const types = typeEffectivenessToTypes[typeEffectiveness];

        // Stage the individual lines of the description
        const lines = [
            Text.bold(`${prefix} ${typeEffectiveness}x ${suffix}`),
            types.join(', '),
            '',
        ];

        return createEmbedMessageDescriptionAndPage({
            lines,
            pageData,
            index,
        });
    }, {
        pages: [initialString],
        curPage: 0,
    });

    return getPagedEmbedBuilders({
        title: `${capitalizeFirstLetter(role)} Type Effectiveness`,
        pages,
    });
};
