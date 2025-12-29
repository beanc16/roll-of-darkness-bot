import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PokemonType } from '../../types/pokemon.js';

export class FakemonBasicInformationManagerService
{
    private static allTypes = new Set(Object.values(PokemonType));

    public static async setTypes({
        messageId,
        fakemon,
        types,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        types: PokemonType[];
    }): Promise<PtuFakemonCollection>
    {
        if (types.length === 0 || types.length > 2)
        {
            throw new Error('Fakemon must have 1-2 types');
        }

        const invalidTypes = types.filter((type) => !this.allTypes.has(type));
        if (invalidTypes.length > 0)
        {
            throw new Error(`Invalid types: ${invalidTypes.join(', ')}`);
        }

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            types,
        });
    }

    public static async setAbilities({
        messageId,
        fakemon,
        abilities,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        abilities: Partial<PtuFakemonCollection['abilities']>;
    }): Promise<PtuFakemonCollection>
    {
        const shouldUpdate: Record<keyof PtuFakemonCollection['abilities'], boolean> = {
            basicAbilities: !!abilities.basicAbilities && abilities.basicAbilities?.length > 0,
            advancedAbilities: !!abilities.advancedAbilities && abilities.advancedAbilities?.length > 0,
            highAbility: !!abilities.highAbility && abilities.highAbility?.length > 0,
        };

        // Exit early if there's no abilities to update
        if (Object.values(abilities).length === 0)
        {
            return fakemon;
        }

        const abilitiesToValidate: PtuFakemonCollection['abilities'] = {
            basicAbilities: abilities.basicAbilities ?? fakemon.abilities.basicAbilities,
            advancedAbilities: abilities.advancedAbilities ?? fakemon.abilities.advancedAbilities,
            highAbility: abilities.highAbility ?? fakemon.abilities.highAbility,
        };

        if (
            abilitiesToValidate.basicAbilities.length === 0
            || abilitiesToValidate.basicAbilities.length > 2
        )
        {
            throw new Error('Fakemon must have 1-2 basic abilities');
        }
        if (
            abilitiesToValidate.advancedAbilities.length === 0
            || abilitiesToValidate.advancedAbilities.length > 3
        )
        {
            throw new Error('Fakemon must have 1-3 advanced abilities');
        }
        if (!abilities.highAbility)
        {
            throw new Error('Fakemon must have a high ability');
        }
        if (!((
            abilitiesToValidate.basicAbilities.length === 2
            && abilitiesToValidate.advancedAbilities.length === 2
        ) || (
            abilitiesToValidate.basicAbilities.length === 1
            && abilitiesToValidate.advancedAbilities.length === 3
        ))) {
            throw new Error('Fakemon must have 2 basic abilities and 2 advanced abilities OR 1 basic ability and 3 advanced abilities');
        }

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            abilities: {
                ...fakemon.abilities,
                ...(shouldUpdate.basicAbilities && {
                    basicAbilities: abilitiesToValidate.basicAbilities,
                }),
                ...(shouldUpdate.advancedAbilities && {
                    advancedAbilities: abilitiesToValidate.advancedAbilities,
                }),
                ...(shouldUpdate.highAbility && {
                    highAbility: abilitiesToValidate.highAbility,
                }),
            },
        });
    }
}
