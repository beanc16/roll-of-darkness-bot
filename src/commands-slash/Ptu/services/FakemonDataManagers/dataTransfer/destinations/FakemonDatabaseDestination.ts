/* eslint-disable class-methods-use-this */

import { DataTransferDestination } from '../../../../../../services/DataTransfer/DataTransferDestination.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';
import { PtuPokemonCollection } from '../../../../dal/models/PtuPokemonCollection.js';
import { PokemonController } from '../../../../dal/PtuController.js';
import {
    PokemonDiet,
    PokemonEggGroup,
    PokemonHabitat,
    PokemonType,
    PtuHeight,
} from '../../../../types/pokemon.js';
import { FakemonGeneralInformationManagerService } from '../../FakemonGeneralInformationManagerService.js';

export class FakemonDatabaseDestination extends DataTransferDestination<PtuPokemonCollection, PtuFakemonCollection>
{
    private readonly allTypes = new Set(Object.values(PokemonType));
    private readonly allHeights = new Set(Object.values(PtuHeight));
    private readonly allEggGroups = new Set(Object.values(PokemonEggGroup));
    private readonly allDiets = new Set(Object.values(PokemonDiet));
    private readonly allHabitats = new Set(Object.values(PokemonHabitat));

    public async create(input: PtuPokemonCollection, source: PtuFakemonCollection): Promise<void>
    {
        // Do not continue if the fakemon has already been transferred
        if (await this.wasTransferred(input, source))
        {
            return;
        }

        this.validateInput(input);

        // Insert only if another pokemon with id and this name does not exist already
        await PokemonController.insertOneIfNotExists({
            // eslint-disable-next-line no-underscore-dangle
            $or: [{ _id: input._id }, { name: input.name }],
        }, input);

        // Say that the fakemon has been transferred
        await FakemonGeneralInformationManagerService.updateTransferredTo({
            fakemon: source,
            transferredTo: {
                ptuDatabase: true,
            },
        });
    }

    protected validateInput(input: PtuPokemonCollection): asserts input is PtuPokemonCollection
    {
        if (!input)
        {
            throw new Error('Pokemon must be truthy');
        }

        // Name
        if (input.name?.trim().length === 0)
        {
            throw new Error('Pokemon name must not be empty');
        }

        // Types
        if (input.types?.length < 1 || input.types?.length > 2)
        {
            throw new Error('Pokemon must have 1-2 types');
        }
        if (input.types?.some((type) => !this.allTypes.has(type as PokemonType)))
        {
            throw new Error('Invalid pokemon types');
        }

        // Stats
        const baseStatsValues = Object.values(input.baseStats);
        if (baseStatsValues.length !== 6)
        {
            throw new Error('Pokemon must have 6 base stats');
        }
        if (baseStatsValues.some((stat) => stat < 0))
        {
            throw new Error('All pokemon stats must be positive');
        }

        // Abilities
        const { abilities } = input;
        if (abilities?.basicAbilities?.length < 1 || abilities?.basicAbilities?.length > 2)
        {
            throw new Error('Pokemon must have 1-2 basic abilities');
        }
        if (abilities?.advancedAbilities?.length < 2 || abilities?.advancedAbilities?.length > 3)
        {
            throw new Error('Pokemon must have 2-3 advanced abilities');
        }
        if (abilities?.highAbility?.trim().length === 0)
        {
            throw new Error('Pokemon must have 1 high ability');
        }
        if (!(
            (
                abilities?.basicAbilities?.length === 1
                && abilities?.advancedAbilities?.length === 3
                && abilities?.highAbility?.trim().length > 0
            ) || (
                abilities?.basicAbilities?.length === 2
                && abilities?.advancedAbilities?.length === 2
                && abilities?.highAbility?.trim().length > 0
            )
        ))
        {
            throw new Error('Pokemon must have 1 basic ability, 3 advanced abilities and 1 high ability OR 2 basic abilities, 2 advanced abilities and 1 high ability');
        }

        // Evolution
        if (input.evolution?.length === 0)
        {
            throw new Error('Pokemon must have at least one evolution stage');
        }
        if (!input?.evolution?.every((stage) =>
            stage?.name?.trim().length > 0
            && stage?.stage >= 1 && stage?.stage <= 3
            && stage?.level > 0 && stage?.level <= 100,
        ))
        {
            throw new Error('Invalid pokemon evolution');
        }

        // Size Information
        const { sizeInformation } = input;
        if (sizeInformation?.height?.freedom?.trim().length === 0)
        {
            throw new Error('Pokemon must have a height in imperial units');
        }
        if (sizeInformation?.height?.metric?.trim().length === 0)
        {
            throw new Error('Pokemon must have a height in metric units');
        }
        if (sizeInformation?.height?.ptu?.trim().length === 0)
        {
            throw new Error('Pokemon must have a height in ptu units');
        }
        if (sizeInformation?.height?.ptu && !this.allHeights.has(sizeInformation.height.ptu as PtuHeight))
        {
            throw new Error('Invalid pokemon height');
        }
        if (sizeInformation?.weight?.freedom?.trim().length === 0)
        {
            throw new Error('Pokemon must have a weight in imperial units');
        }
        if (sizeInformation?.weight?.metric?.trim().length === 0)
        {
            throw new Error('Pokemon must have a weight in metric units');
        }
        if (sizeInformation?.weight?.ptu <= 0 || sizeInformation?.weight?.ptu > 7)
        {
            throw new Error('Pokemon must have a weight in ptu units between 1-7');
        }

        // Breeding Information
        const { breedingInformation } = input;
        if (breedingInformation?.averageHatchRate?.trim().length === 0)
        {
            throw new Error('Pokemon must have an average hatch rate');
        }
        if (breedingInformation?.eggGroups?.length < 1 || breedingInformation?.eggGroups?.length > 2)
        {
            throw new Error('Pokemon must have 1-2 egg groups');
        }
        if (!breedingInformation?.eggGroups?.every((eggGroup) =>
            eggGroup.trim().length > 0
            && this.allEggGroups.has(eggGroup as PokemonEggGroup),
        ))
        {
            throw new Error('Invalid pokemon egg groups');
        }
        if (
            breedingInformation?.genderRatio?.male !== undefined
            && breedingInformation?.genderRatio?.female !== undefined
            && breedingInformation.genderRatio.male + breedingInformation.genderRatio.female !== 100
        )
        {
            throw new Error('Male and female gender ratios must add up to 100');
        }
        if (
            breedingInformation?.genderRatio?.male === undefined
            && breedingInformation?.genderRatio?.female === undefined
            && breedingInformation.genderRatio.none !== true
        )
        {
            throw new Error('None gender ratio must be true when male and female are undefined');
        }

        // Diets
        if (input.diets?.length < 1 || input.diets?.length > 2)
        {
            throw new Error('Pokemon must have 1-2 diets');
        }
        if (!input.diets?.every((diet) =>
            diet?.trim().length > 0
            && this.allDiets.has(diet as PokemonDiet),
        ))
        {
            throw new Error('Invalid pokemon diets');
        }

        // Habitats
        if (input.habitats?.length < 1 || input.habitats?.length > 5)
        {
            throw new Error('Pokemon must have 1-5 habitats');
        }
        if (!input.habitats?.every((habitat) =>
            habitat?.trim().length > 0
            && this.allHabitats.has(habitat as PokemonHabitat),
        ))
        {
            throw new Error('Invalid pokemon habitats');
        }

        // Capabilities
        const { capabilities } = input;
        if (capabilities?.overland < 0)
        {
            throw new Error('Overland capability cannot be negative');
        }
        if (capabilities?.swim !== undefined && capabilities?.swim < 0)
        {
            throw new Error('Swim capability cannot be negative');
        }
        if (capabilities?.sky !== undefined && capabilities?.sky < 0)
        {
            throw new Error('Sky capability cannot be negative');
        }
        if (capabilities?.levitate !== undefined && capabilities?.levitate < 0)
        {
            throw new Error('Levitate capability cannot be negative');
        }
        if (capabilities?.burrow !== undefined && capabilities?.burrow < 0)
        {
            throw new Error('Burrow capability cannot be negative');
        }
        if (capabilities?.highJump < 0)
        {
            throw new Error('High jump capability cannot be negative');
        }
        if (capabilities?.lowJump < 0)
        {
            throw new Error('Low jump capability cannot be negative');
        }
        if (capabilities?.power < 0)
        {
            throw new Error('Power capability cannot be negative');
        }
        if (capabilities?.other !== undefined && !Array.isArray(capabilities.other))
        {
            throw new Error('Other capabilities must be an array or undefined');
        }

        // Skills
        const { skills } = input;
        if (skills?.acrobatics?.trim()?.length === 0)
        {
            throw new Error('Pokemon must have an acrobatics skill');
        }
        if (skills?.athletics?.trim()?.length === 0)
        {
            throw new Error('Pokemon must have an athletics skill');
        }
        if (skills?.combat?.trim()?.length === 0)
        {
            throw new Error('Pokemon must have a combat skill');
        }
        if (skills?.focus?.trim()?.length === 0)
        {
            throw new Error('Pokemon must have an focus skill');
        }
        if (skills?.perception?.trim()?.length === 0)
        {
            throw new Error('Pokemon must have a perception skill');
        }
        if (skills?.stealth?.trim()?.length === 0)
        {
            throw new Error('Pokemon must have a stealth skill');
        }

        // Move List
        const { moveList } = input;
        if (!moveList)
        {
            throw new Error('Pokemon must have a move list');
        }

        const {
            levelUp,
            eggMoves,
            tmHm,
            tutorMoves,
            zygardeCubeMoves,
        } = moveList;
        if (!levelUp)
        {
            throw new Error('Pokemon must have a level up move list');
        }
        if (!eggMoves)
        {
            throw new Error('Pokemon must have an egg move list');
        }
        if (!tmHm)
        {
            throw new Error('Pokemon must have a tm/hm move list');
        }
        if (!tutorMoves)
        {
            throw new Error('Pokemon must have a tutor move list');
        }
        if (zygardeCubeMoves !== undefined && !Array.isArray(zygardeCubeMoves))
        {
            throw new Error('Pokemon must have an undefined or array zygarde cube move list');
        }

        if (levelUp.length === 0)
        {
            throw new Error('Pokemon must have at least one level up move');
        }
        if (levelUp.length > 50)
        {
            throw new Error('Pokemon must have less than 50 level up moves');
        }
        if (!levelUp.every((move) =>
            move?.move?.trim()?.length > 0
            && move?.type?.trim()?.length > 0
            && this.allTypes.has(move?.type as PokemonType)
            && (
                (typeof move?.level === 'string') || (
                    typeof move?.level === 'number'
                    && move?.level >= 0
                    && move?.level <= 100
                )
            ),
        ))
        {
            throw new Error('Invalid level up moves');
        }
        if (!eggMoves.every((move) => move?.trim()?.length > 0))
        {
            throw new Error('Invalid egg moves');
        }
        if (!tmHm.every((move) => move?.trim()?.length > 0))
        {
            throw new Error('Invalid tm/hm moves');
        }
        if (!tutorMoves.every((move) => move?.trim()?.length > 0))
        {
            throw new Error('Invalid tutor moves');
        }
        if (zygardeCubeMoves !== undefined && !zygardeCubeMoves.every((move) => move?.trim()?.length > 0))
        {
            throw new Error('Invalid zygarde cube moves');
        }

        // Metadata
        const { metadata } = input;
        if (metadata.dexNumber === undefined)
        {
            throw new Error('Pokemon must have a dex number');
        }
        if (metadata.dexNumber.trim().length === 0)
        {
            throw new Error('Pokemon dex number cannot be empty');
        }
        if (metadata.source.trim().length === 0)
        {
            throw new Error('Pokemon source cannot be empty');
        }
        if (metadata.imageUrl !== undefined && metadata.imageUrl.trim().length === 0)
        {
            throw new Error('Pokemon image url must be undefined or not empty');
        }

        // Mega Evolutions
        const { megaEvolutions } = input;
        if (megaEvolutions !== undefined && !Array.isArray(megaEvolutions))
        {
            throw new Error('Mega evolutions must be an array or undefined');
        }
        if (megaEvolutions !== undefined && !megaEvolutions?.every((megaEvolution) =>
        {
            if (!megaEvolution?.stats)
            {
                return false;
            }
            const stats = Object.values(megaEvolution?.stats);
            return (megaEvolution?.name?.trim()?.length > 0
                && (
                    megaEvolution?.types?.length === 0
                    || megaEvolution?.types?.every((type) => this.allTypes.has(type as PokemonType))
                )
                && megaEvolution?.ability?.trim()?.length > 0
                && (
                    megaEvolution?.abilityShift === undefined
                    || megaEvolution?.abilityShift?.trim()?.length > 0
                )
                && (
                    megaEvolution?.capabilities === undefined
                    || Array.isArray(megaEvolution?.capabilities)
                )
                && stats.every((stat) => stat?.trim().length > 0)
            );
        }))
        {
            throw new Error('Invalid mega evolution(s)');
        }
    }

    public async wasTransferred(input: PtuPokemonCollection, source: PtuFakemonCollection): Promise<boolean>
    {
        const { results = [] } = await PokemonController.getAll({
            // eslint-disable-next-line no-underscore-dangle
            $or: [{ _id: input._id }, { name: input.name }],
        }) as { results: PtuPokemonCollection[] };

        return results.length > 0 && source.transferredTo.ptuDatabase;
    }
}
