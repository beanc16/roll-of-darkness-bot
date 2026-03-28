import { ObjectId } from 'mongodb';

import {
    PokemonDiet,
    PokemonEggGroup,
    PokemonHabitat,
    PokemonType,
    PtuHeight,
    PtuPokemon,
} from '../../types/pokemon.js';

// TODO: Move this to a dedicated API for roll of darkness to call later instead
interface PtuPokemonEdit extends Partial<Omit<PtuPokemon, 'name' | 'olderVersions'>>
{
    editName: string;
}

export class PtuPokemonCollection
{
    private static readonly allTypes = new Set(Object.values(PokemonType));
    private static readonly allHeights = new Set(Object.values(PtuHeight));
    private static readonly allEggGroups = new Set(Object.values(PokemonEggGroup));
    private static readonly allDiets = new Set(Object.values(PokemonDiet));
    private static readonly allHabitats = new Set(Object.values(PokemonHabitat));

    public _id: ObjectId;
    public name: PtuPokemon['name'];
    public types: PtuPokemon['types'];
    public baseStats: PtuPokemon['baseStats'];
    public abilities: PtuPokemon['abilities'];
    public evolution: PtuPokemon['evolution'];
    public sizeInformation: PtuPokemon['sizeInformation'];
    public breedingInformation: PtuPokemon['breedingInformation'];
    public diets: PtuPokemon['diets'];
    public habitats: PtuPokemon['habitats'];
    public capabilities: PtuPokemon['capabilities'];
    public skills: PtuPokemon['skills'];
    public moveList: PtuPokemon['moveList'];
    public megaEvolutions: PtuPokemon['megaEvolutions'];
    public metadata: PtuPokemon['metadata'];
    public extras: PtuPokemon['extras'];
    public edits?: PtuPokemonEdit[];

    constructor({
        _id,
        name,
        types,
        baseStats,
        abilities,
        evolution,
        sizeInformation,
        breedingInformation,
        diets,
        habitats,
        capabilities,
        skills,
        moveList,
        megaEvolutions,
        metadata,
        extras,
        edits = [],
    }: PtuPokemon & { _id: ObjectId; edits?: PtuPokemonEdit[] })
    {
        if (_id)
        {
            // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
            this._id = _id;
        }
        else
        {
            // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
            this._id = new ObjectId();
        }

        this.name = name;
        this.types = types;
        this.baseStats = baseStats;
        this.abilities = abilities;
        this.evolution = evolution;
        this.sizeInformation = sizeInformation;
        this.breedingInformation = breedingInformation;
        this.diets = diets;
        this.habitats = habitats;
        this.capabilities = capabilities;
        this.skills = skills;
        this.moveList = {
            levelUp: moveList?.levelUp,
            tmHm: moveList?.tmHm,
            eggMoves: moveList?.eggMoves,
            tutorMoves: moveList?.tutorMoves,
        };
        this.metadata = metadata;

        if (moveList?.zygardeCubeMoves && moveList.zygardeCubeMoves.length > 0)
        {
            this.moveList.zygardeCubeMoves = moveList.zygardeCubeMoves;
        }

        if (extras && extras.length > 0)
        {
            this.extras = extras;
        }

        if (edits && edits.length > 0)
        {
            this.edits = edits;
        }

        if (megaEvolutions && megaEvolutions.length > 0)
        {
            this.megaEvolutions = megaEvolutions;
        }
    }

    public toPtuPokemon(): PtuPokemon
    {
        // Data setup
        const {
            _id,
            edits,
            ...originalPokemonData
        } = this;
        const originalPokemon: PtuPokemon = { ...originalPokemonData, versionName: 'Original' };
        const {
            name: _name,
            ...originalPokemonDataWithoutName
        } = originalPokemonData;

        // Get most recent & remaining edits
        const editsReversed = edits?.toReversed() ?? [];
        const [mostRecentEdit, ...remainingEdits] = editsReversed;

        // Create output that has all possible edits
        let output: PtuPokemon = {
            ...originalPokemon,
            ...(mostRecentEdit
                ? PtuPokemonCollection.toPtuPokemonEdit(originalPokemon, mostRecentEdit)
                : {}
            ),
        };

        // Update output with remaining edits so it has the most up-to-date data
        remainingEdits?.forEach((edit) =>
        {
            const {
                versionName: _,
                ...editData
            } = PtuPokemonCollection.toPtuPokemonEdit(output, edit);

            output = {
                name: output.name,
                versionName: output.versionName,
                ...editData,
            };
        });

        // Get older versions
        let previousVersion = originalPokemon;
        const olderVersions = remainingEdits?.toReversed().map((edit) =>
        {
            const newVersion = PtuPokemonCollection.toPtuPokemonEdit(previousVersion, edit);
            previousVersion = {
                ...previousVersion,
                ...newVersion,
            };

            return newVersion;
        }) ?? [];

        // Add the original data as the "last" edit
        if (edits && edits.length > 0)
        {
            olderVersions.push(
                PtuPokemonCollection.toPtuPokemonEdit(originalPokemon, {
                    editName: 'Original',
                    ...originalPokemonDataWithoutName,
                }),
            );
        }

        if (olderVersions.length > 0)
        {
            output.olderVersions = olderVersions;
        }

        return output;
    }

    private static toPtuPokemonEdit(output: PtuPokemon, edit: PtuPokemonEdit): NonNullable<PtuPokemon['olderVersions']>[0]
    {
        const {
            name: _,
            sizeInformation,
            breedingInformation,
            skills,
            abilities,
            moveList,
            capabilities,
            metadata,
            ...outputData
        } = output;

        const {
            editName,
            sizeInformation: editSizeInformation,
            breedingInformation: editBreedingInformation,
            skills: editSkills,
            abilities: editAbilities,
            moveList: editMoveList,
            capabilities: editCapabilities,
            metadata: editMetadata,
            ...editData
        } = edit;

        return {
            ...outputData,
            ...editData,
            versionName: editName,
            sizeInformation: {
                height: {
                    ...sizeInformation.height,
                    ...(editSizeInformation?.height ?? {}),
                },
                weight: {
                    ...sizeInformation.weight,
                    ...(editSizeInformation?.weight ?? {}),
                },
            },
            breedingInformation: {
                ...breedingInformation,
                ...(editBreedingInformation ?? {}),
                genderRatio: {
                    ...breedingInformation.genderRatio,
                    ...(editBreedingInformation?.genderRatio ?? {}),
                },
            },
            skills: {
                ...skills,
                ...(editSkills ?? {}),
            },
            moveList: {
                ...moveList,
                ...(editMoveList ?? {}),
            },
            abilities: {
                ...abilities,
                ...(editAbilities ?? {}),
            },
            capabilities: {
                ...capabilities,
                ...(editCapabilities ?? {}),
            },
            metadata: {
                ...metadata,
                ...(editMetadata ?? {}),
            },
        };
    }

    public static validate(input: PtuPokemonCollection, options?: { skipDexNumberError: boolean }): asserts input is PtuPokemonCollection
    {
        const errors: Error[] = [];

        if (!input)
        {
            errors.push(new Error('Pokemon must be truthy'));
            // Exit early if pokemon is falsy
            throw new AggregateError(errors);
        }

        // Name
        if (input.name?.trim().length === 0)
        {
            errors.push(new Error('Pokemon name must not be empty'));
        }

        // Types
        if (input.types?.length < 1 || input.types?.length > 2)
        {
            errors.push(new Error('Pokemon must have 1-2 types'));
        }
        if (input.types?.some((type) => !this.allTypes.has(type as PokemonType)))
        {
            errors.push(new Error('Invalid pokemon types'));
        }

        // Stats
        const baseStatsValues = Object.values(input.baseStats);
        if (baseStatsValues.length !== 6)
        {
            errors.push(new Error('Pokemon must have 6 base stats'));
        }
        if (baseStatsValues.some((stat) => stat < 0))
        {
            errors.push(new Error('All pokemon stats must be positive'));
        }

        // Abilities
        const { abilities } = input;
        if (abilities?.basicAbilities?.length < 1 || abilities?.basicAbilities?.length > 2)
        {
            errors.push(new Error('Pokemon must have 1-2 basic abilities'));
        }
        if (abilities?.advancedAbilities?.length < 2 || abilities?.advancedAbilities?.length > 3)
        {
            errors.push(new Error('Pokemon must have 2-3 advanced abilities'));
        }
        if (abilities?.highAbility?.trim().length === 0)
        {
            errors.push(new Error('Pokemon must have 1 high ability'));
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
            errors.push(new Error('Pokemon must have 1 basic ability, 3 advanced abilities and 1 high ability OR 2 basic abilities, 2 advanced abilities and 1 high ability'));
        }

        // Evolution
        if (input.evolution?.length === 0)
        {
            errors.push(new Error('Pokemon must have at least one evolution stage'));
        }
        if (!input?.evolution?.every((stage) =>
            stage?.name?.trim().length > 0
            && stage?.stage >= 1 && stage?.stage <= 3
            && stage?.level > 0 && stage?.level <= 100,
        ))
        {
            errors.push(new Error('Invalid pokemon evolution'));
        }

        // Size Information
        const { sizeInformation } = input;
        if (sizeInformation?.height?.freedom?.trim().length === 0)
        {
            errors.push(new Error('Pokemon must have a height in imperial units'));
        }
        if (sizeInformation?.height?.metric?.trim().length === 0)
        {
            errors.push(new Error('Pokemon must have a height in metric units'));
        }
        if (sizeInformation?.height?.ptu?.trim().length === 0)
        {
            errors.push(new Error('Pokemon must have a height in ptu units'));
        }
        if (sizeInformation?.height?.ptu && !this.allHeights.has(sizeInformation.height.ptu as PtuHeight))
        {
            errors.push(new Error('Invalid pokemon height'));
        }
        if (sizeInformation?.weight?.freedom?.trim().length === 0)
        {
            errors.push(new Error('Pokemon must have a weight in imperial units'));
        }
        if (sizeInformation?.weight?.metric?.trim().length === 0)
        {
            errors.push(new Error('Pokemon must have a weight in metric units'));
        }
        if (sizeInformation?.weight?.ptu <= 0 || sizeInformation?.weight?.ptu > 7)
        {
            errors.push(new Error('Pokemon must have a weight in ptu units between 1-7'));
        }

        // Breeding Information
        const { breedingInformation } = input;
        if (breedingInformation?.averageHatchRate?.trim().length === 0)
        {
            errors.push(new Error('Pokemon must have an average hatch rate'));
        }
        if (breedingInformation?.eggGroups?.length < 1 || breedingInformation?.eggGroups?.length > 2)
        {
            errors.push(new Error('Pokemon must have 1-2 egg groups'));
        }
        if (!breedingInformation?.eggGroups?.every((eggGroup) =>
            eggGroup.trim().length > 0
            && this.allEggGroups.has(eggGroup as PokemonEggGroup),
        ))
        {
            errors.push(new Error('Invalid pokemon egg groups'));
        }
        if (
            breedingInformation?.genderRatio?.male !== undefined
            && breedingInformation?.genderRatio?.female !== undefined
            && breedingInformation.genderRatio.male + breedingInformation.genderRatio.female !== 100
        )
        {
            errors.push(new Error('Male and female gender ratios must add up to 100'));
        }
        if (
            breedingInformation?.genderRatio?.male === undefined
            && breedingInformation?.genderRatio?.female === undefined
            && breedingInformation.genderRatio.none !== true
        )
        {
            errors.push(new Error('None gender ratio must be true when male and female are undefined'));
        }

        // Diets
        if (input.diets?.length < 1 || input.diets?.length > 2)
        {
            errors.push(new Error('Pokemon must have 1-2 diets'));
        }
        if (!input.diets?.every((diet) =>
            diet?.trim().length > 0
            && this.allDiets.has(diet as PokemonDiet),
        ))
        {
            errors.push(new Error('Invalid pokemon diets'));
        }

        // Habitats
        if (input.habitats?.length < 1 || input.habitats?.length > 5)
        {
            errors.push(new Error('Pokemon must have 1-5 habitats'));
        }
        if (!input.habitats?.every((habitat) =>
            habitat?.trim().length > 0
            && this.allHabitats.has(habitat as PokemonHabitat),
        ))
        {
            errors.push(new Error('Invalid pokemon habitats'));
        }

        // Capabilities
        const { capabilities } = input;
        if (capabilities?.overland < 0)
        {
            errors.push(new Error('Overland capability cannot be negative'));
        }
        if (capabilities?.swim !== undefined && capabilities?.swim < 0)
        {
            errors.push(new Error('Swim capability cannot be negative'));
        }
        if (capabilities?.sky !== undefined && capabilities?.sky < 0)
        {
            errors.push(new Error('Sky capability cannot be negative'));
        }
        if (capabilities?.levitate !== undefined && capabilities?.levitate < 0)
        {
            errors.push(new Error('Levitate capability cannot be negative'));
        }
        if (capabilities?.burrow !== undefined && capabilities?.burrow < 0)
        {
            errors.push(new Error('Burrow capability cannot be negative'));
        }
        if (capabilities?.highJump < 0)
        {
            errors.push(new Error('High jump capability cannot be negative'));
        }
        if (capabilities?.lowJump < 0)
        {
            errors.push(new Error('Low jump capability cannot be negative'));
        }
        if (capabilities?.power < 0)
        {
            errors.push(new Error('Power capability cannot be negative'));
        }
        if (capabilities?.other !== undefined && !Array.isArray(capabilities.other))
        {
            errors.push(new Error('Other capabilities must be an array or undefined'));
        }

        // Skills
        const { skills } = input;
        if (skills?.acrobatics?.trim()?.length === 0)
        {
            errors.push(new Error('Pokemon must have an acrobatics skill'));
        }
        if (skills?.athletics?.trim()?.length === 0)
        {
            errors.push(new Error('Pokemon must have an athletics skill'));
        }
        if (skills?.combat?.trim()?.length === 0)
        {
            errors.push(new Error('Pokemon must have a combat skill'));
        }
        if (skills?.focus?.trim()?.length === 0)
        {
            errors.push(new Error('Pokemon must have an focus skill'));
        }
        if (skills?.perception?.trim()?.length === 0)
        {
            errors.push(new Error('Pokemon must have a perception skill'));
        }
        if (skills?.stealth?.trim()?.length === 0)
        {
            errors.push(new Error('Pokemon must have a stealth skill'));
        }

        // Move List
        const { moveList } = input;
        if (!moveList)
        {
            errors.push(new Error('Pokemon must have a move list'));
        }

        const {
            levelUp,
            eggMoves,
            tmHm,
            tutorMoves,
            zygardeCubeMoves,
        } = moveList || {};
        if (!levelUp)
        {
            errors.push(new Error('Pokemon must have a level up move list'));
        }
        if (!eggMoves)
        {
            errors.push(new Error('Pokemon must have an egg move list'));
        }
        if (!tmHm)
        {
            errors.push(new Error('Pokemon must have a tm/hm move list'));
        }
        if (!tutorMoves)
        {
            errors.push(new Error('Pokemon must have a tutor move list'));
        }
        if (zygardeCubeMoves !== undefined && !Array.isArray(zygardeCubeMoves))
        {
            errors.push(new Error('Pokemon must have an undefined or array zygarde cube move list'));
        }

        if (!Array.isArray(levelUp) || levelUp.length === 0)
        {
            errors.push(new Error('Pokemon must have at least one level up move'));
        }
        if (Array.isArray(levelUp) && levelUp.length > 50)
        {
            errors.push(new Error('Pokemon must have less than 50 level up moves'));
        }
        if (Array.isArray(levelUp) && !levelUp.every((move) =>
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
            errors.push(new Error('Invalid level up moves'));
        }
        if (Array.isArray(eggMoves) && !eggMoves.every((move) => move?.trim()?.length > 0))
        {
            errors.push(new Error('Invalid egg moves'));
        }
        if (Array.isArray(tmHm) && !tmHm.every((move) => move?.trim()?.length > 0))
        {
            errors.push(new Error('Invalid tm/hm moves'));
        }
        if (Array.isArray(tutorMoves) && !tutorMoves.every((move) => move?.trim()?.length > 0))
        {
            errors.push(new Error('Invalid tutor moves'));
        }
        if (zygardeCubeMoves !== undefined && Array.isArray(zygardeCubeMoves) && !zygardeCubeMoves.every((move) => move?.trim()?.length > 0))
        {
            errors.push(new Error('Invalid zygarde cube moves'));
        }

        // Metadata
        const { metadata } = input;
        if (metadata.dexNumber === undefined && !options?.skipDexNumberError)
        {
            errors.push(new Error('Pokemon must have a dex number'));
        }
        if (metadata.dexNumber !== undefined && metadata.dexNumber.trim().length === 0 && !options?.skipDexNumberError)
        {
            errors.push(new Error('Pokemon dex number cannot be empty'));
        }
        if (metadata.source.trim().length === 0)
        {
            errors.push(new Error('Pokemon source cannot be empty'));
        }
        if (metadata.imageUrl !== undefined && metadata.imageUrl.trim().length === 0)
        {
            errors.push(new Error('Pokemon image url must be undefined or not empty'));
        }

        // Mega Evolutions
        const { megaEvolutions } = input;
        if (megaEvolutions !== undefined && !Array.isArray(megaEvolutions))
        {
            errors.push(new Error('Mega evolutions must be an array or undefined'));
        }
        if (megaEvolutions !== undefined && Array.isArray(megaEvolutions) && !megaEvolutions?.every((megaEvolution) =>
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
            errors.push(new Error('Invalid mega evolution(s)'));
        }

        if (errors.length > 0)
        {
            throw new AggregateError(errors);
        }
    }
}
