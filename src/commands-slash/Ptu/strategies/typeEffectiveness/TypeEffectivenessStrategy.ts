import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { getTypeEffectivenessEmbedMessages } from '../../embed-messages/typeEffectiveness.js';
import { PtuTypeEffectivenessSubcommand } from '../../options/typeEffectiveness.js';
import {
    PokemonTypeEffectivenessService,
    PokemonTypePossibility,
    TypeEffectivenessRole,
} from '../../services/PokemonTypeEffectivenessService.js';
import { PokemonTypeAndNone } from '../../types/pokemon.js';
import { PtuAbilityForTypeEffectiveness } from '../../types/PtuAbilityForTypeEffectiveness.js';
import { CharacterSheetStrategy } from '../CharacterSheetStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class TypeEffectivenessStrategy extends CharacterSheetStrategy
{
    public static key = PtuTypeEffectivenessSubcommand.TypeEffectiveness;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const role = interaction.options.getString('role', true) as TypeEffectivenessRole;
        const type1 = interaction.options.getString('type_1', true) as PokemonTypeAndNone;
        const type2 = interaction.options.getString('type_2') as PokemonTypeAndNone | null;
        const type3 = interaction.options.getString('type_3') as PokemonTypeAndNone | null;
        const ability1 = interaction.options.getString('ability_1') as PtuAbilityForTypeEffectiveness | null;
        const ability2 = interaction.options.getString('ability_2') as PtuAbilityForTypeEffectiveness | null;
        const ability3 = interaction.options.getString('ability_3') as PtuAbilityForTypeEffectiveness | null;
        const ability4 = interaction.options.getString('ability_4') as PtuAbilityForTypeEffectiveness | null;

        // Create input types
        const types = [type1];
        const abilities = [
            ability1,
            ability2,
            ability3,
            ability4,
        ].filter(ability => ability !== null);

        if (type2)
        {
            types.push(type2);
        }
        if (type3)
        {
            types.push(type3);
        }

        // Get type effectiveness
        const typeEffectivenessResults = PokemonTypeEffectivenessService.getTypeEffectivenessForTypes(
            role,
            types,
            abilities,
        );

        // Parse to response
        const typeEffectivenessToTypes = Object.entries(typeEffectivenessResults).reduce<
            Record<number, PokemonTypePossibility[]>
        >((acc, cur) =>
        {
            const [type, typeEffectiveness] = cur as [
                PokemonTypePossibility,
                number,
            ];

            if (acc[typeEffectiveness] === undefined)
            {
                acc[typeEffectiveness] = [];
            }

            acc[typeEffectiveness].push(type);

            return acc;
        }, {});

        // Send response
        const embeds = getTypeEffectivenessEmbedMessages({
            inputTypes: types,
            inputAbilities: abilities,
            role,
            typeEffectivenessToTypes,
        });

        await interaction.editReply({
            embeds,
        });

        return true;
    }
}
