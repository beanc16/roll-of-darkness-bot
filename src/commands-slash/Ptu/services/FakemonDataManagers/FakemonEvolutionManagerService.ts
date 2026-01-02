import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';

export class FakemonEvolutionManagerService
{
    public static async addEvolutionStage({
        messageId,
        fakemon,
        name,
        level,
        stage,
        evolutionCondition,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        name: string;
        level: number;
        stage: number;
        evolutionCondition?: string;
    }): Promise<PtuFakemonCollection>
    {
        if (name.trim().length === 0)
        {
            throw new Error('Name cannot be empty');
        }
        if (level < 0)
        {
            throw new Error('Level cannot be negative');
        }
        if (level > 100)
        {
            throw new Error('Level cannot be greater than 100');
        }
        if (stage < 0)
        {
            throw new Error('Stage cannot be negative');
        }
        if (stage > 3)
        {
            throw new Error('Stage cannot be greater than 3');
        }
        if (fakemon.evolution.some((evolution) => evolution.name === name))
        {
            throw new Error(`Fakemon already has an evolution named ${name}`);
        }

        // Sort evolutions
        const sortedEvolution = this.sortEvolutions([
            ...fakemon.evolution,
            {
                name: `${name}${evolutionCondition ? ` ${evolutionCondition}` : ''}`,
                level,
                stage,
            },
        ]);
        if (sortedEvolution.length >= 10)
        {
            throw new Error('Fakemon cannot have more than 10 evolutions');
        }

        // Update fakemon
        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            evolution: sortedEvolution,
        });
    }

    public static async editEvolutionStage({
        messageId,
        fakemon,
        previousName,
        new: { name, level, stage, evolutionCondition },
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        previousName: string;
        new: {
            name: string;
            level: number;
            stage: number;
            evolutionCondition?: string;
        };
    }): Promise<PtuFakemonCollection>
    {
        if (previousName.trim().length === 0)
        {
            throw new Error('Previous name cannot be empty');
        }
        if (name.trim().length === 0)
        {
            throw new Error('New name cannot be empty');
        }
        if (level < 0)
        {
            throw new Error('Level cannot be negative');
        }
        if (level > 100)
        {
            throw new Error('Level cannot be greater than 100');
        }
        if (stage < 0)
        {
            throw new Error('Stage cannot be negative');
        }
        if (stage > 3)
        {
            throw new Error('Stage cannot be greater than 3');
        }

        // Get index of evolution
        const index = fakemon.evolution.findIndex((evolution) => evolution.name === previousName.trim());
        if (index === -1)
        {
            throw new Error(`Fakemon does not have an evolution named ${previousName.trim()}`);
        }

        // Check if there's another evolution with the same name
        if (fakemon.evolution.some((evolution, curIndex) => evolution.name === name.trim() && curIndex !== index))
        {
            throw new Error(`Fakemon already has an evolution named ${name.trim()}`);
        }

        // Update evolution
        fakemon.evolution[index] = {
            name: `${name}${evolutionCondition ? ` ${evolutionCondition}` : ''}`,
            level,
            stage,
        };

        // Sort evolutions
        const sortedEvolution = this.sortEvolutions(fakemon.evolution);
        if (sortedEvolution.length >= 10)
        {
            throw new Error('Fakemon cannot have more than 10 evolutions');
        }

        // Update fakemon
        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            evolution: sortedEvolution,
        });
    }

    public static async removeEvolutionStage({
        messageId,
        fakemon,
        names,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        names: string[];
    }): Promise<PtuFakemonCollection>
    {
        const { removed, updatedEvolution } = fakemon.evolution.reduce<{ removed: PtuFakemonCollection['evolution'], updatedEvolution: PtuFakemonCollection['evolution'] }>(
            (acc, cur) => {
                if (names.includes(cur.name))
                {
                    acc.removed.push(cur);
                }
                else
                {
                    acc.updatedEvolution.push(cur);
                }
                return acc;
            }, { removed: [], updatedEvolution: [] });

        const missing = names.filter((name) => !removed.some((evolution) => evolution.name === name));
        if (missing.length > 0)
        {
            throw new Error(`Fakemon does not have evolutions named ${missing.join(', ')}`);
        }

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            evolution: updatedEvolution,
        });
    }

    public static extractEvolutionConditionFromName(
        name: string,
        evolutionStage: PtuFakemonCollection['evolution'][number],
    ): string | undefined
    {
        // The evolution name comes after the species name, so get all text after the name itself
        const firstCharacterIndex = evolutionStage.name.lastIndexOf(name.trim());
        const lastCharacterIndex = firstCharacterIndex === -1
            ? -1
            : firstCharacterIndex + name.trim().length;

        if (lastCharacterIndex === -1)
        {
            return undefined;
        }

        const evolutionCondition = evolutionStage.name.substring(lastCharacterIndex).trim();

        if (evolutionCondition.length === 0)
        {
            return undefined;
        }

        return evolutionCondition;
    }

    private static sortEvolutions(evolution: PtuFakemonCollection['evolution']): PtuFakemonCollection['evolution']
    {
        // Create a copy of the array to avoid mutating the original,
        // then sort by stage, level, then name.
        return [...evolution].sort((a, b) =>
        {
            // Sort by stage
            if (a.stage < b.stage)
            {
                return -1;
            }
            if (a.stage > b.stage)
            {
                return 1;
            }

            // Sort by level
            if (a.level < b.level)
            {
                return -1;
            }
            if (a.level > b.level)
            {
                return 1;
            }

            // Sort by name
            return a.name.localeCompare(b.name);
        });
    }
}
