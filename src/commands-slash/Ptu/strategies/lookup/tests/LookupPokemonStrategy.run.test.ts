import { getFakeMessage } from '../../../../../fakes/discord/components.js';
import { FakeChatInputCommandInteraction, getFakeButtonInteraction } from '../../../../../fakes/discord/interactions.js';
import { CommandName } from '../../../../../types/discord.js';
import { PaginationStrategy } from '../../../../strategies/PaginationStrategy/PaginationStrategy.js';
import { LookupPokemonActionRowBuilder } from '../../../components/lookup/LookupPokemonActionRowBuilder.js';
import type { PtuPokemonForLookupPokemon } from '../../../embed-messages/lookup.js';
import { createPtuMoveData } from '../../../fakes/PtuMove.fakes.js';
import { createPtuPokemonData, createPtuPokemonDataBulk } from '../../../fakes/PtuPokemon.fakes.js';
import { PtuSubcommandGroup } from '../../../options/index.js';
import { PtuLookupSubcommand } from '../../../options/lookup.js';
import { PtuAutocompleteParameterName } from '../../../types/autocomplete.js';
import type { PtuStrategyMap } from '../../../types/strategies.js';
import { LookupAbilityStrategy } from '../LookupAbilityStrategy.js';
import { LookupMoveStrategy } from '../LookupMoveStrategy.js';
import { LookupPokemonStrategy } from '../LookupPokemonStrategy.js';

jest.mock('../../../dal/PtuController', () =>
{
    return {
        PokemonController: {
            getAll: jest.fn(),
            getMoveListTypeSearchParams: jest.fn(),
        },
    };
});

jest.mock('../../../services/PokeApi/PokeApi', () =>
{
    return {
        PokeApi: {
            getImageUrls: jest.fn(),
            parseName: jest.fn(),
        },
    };
});

jest.mock('../../../services/HomebrewPokeApi/HomebrewPokeApi', () =>
{
    return {
        HomebrewPokeApi: {
            getPokemonImageUrls: jest.fn(),
        },
    };
});

/** Full error messages `run` replies with */
const ERROR_MESSAGES = {
    noSearchOption: 'Cannot look up a Pokémon without a name, move, ability, capability, egg groups, or base stat total.',
    tooManySearchOptions: 'Cannot look up a Pokémon by more than just one of name, move, ability, capability, habitat, diet, egg groups, or base stat total at the same time. (Though habitat and diet can be used at the same time.)',
    noPokemonFound: 'No Pokémon were found.',
};

/** Matches an embed whose description contains every string and matches every RegExp given */
const embedDescribing = (...expectedParts: (string | RegExp)[]): unknown => expect.objectContaining({
    data: expect.objectContaining({
        description: {
            asymmetricMatch: (description: unknown): boolean => (
                typeof description === 'string'
                && expectedParts.every(part => (
                    typeof part === 'string'
                        ? description.includes(part)
                        : part.test(description)
                ))
            ),
        },
    }) as unknown,
});

describe(`${LookupPokemonStrategy.name}`, () =>
{
    afterEach(() =>
    {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    describe(`${LookupPokemonStrategy.run.name}`, () =>
    {
        let commandName: CommandName;
        let interaction: FakeChatInputCommandInteraction;
        let strategies: PtuStrategyMap;
        let getStringSpy: jest.SpiedFunction<FakeChatInputCommandInteraction['options']['getString']>;
        let getIntegerSpy: jest.SpiedFunction<FakeChatInputCommandInteraction['options']['getInteger']>;
        let getBooleanSpy: jest.SpiedFunction<FakeChatInputCommandInteraction['options']['getBoolean']>;
        let getLookupDataSpy: jest.SpiedFunction<typeof LookupPokemonStrategy.getLookupData>;
        let getMoveLookupDataSpy: jest.SpiedFunction<typeof LookupMoveStrategy.getLookupData>;
        let getAbilityLookupDataSpy: jest.SpiedFunction<typeof LookupAbilityStrategy.getLookupData>;
        let paginationRunSpy: jest.SpiedFunction<typeof PaginationStrategy.run>;

        /** Sets the slash command options/parameters (by option/parameter name) that `run` reads from the interaction */
        const mockOptions = ({
            strings = {},
            baseStatTotal = null,
            includeContestInfo = null,
        }: {
            /** What the user typed into the command's text options/parameters, keyed by option name; omitted options are `null` */
            strings?: Record<string, string>;
            baseStatTotal?: number | null;
            includeContestInfo?: boolean | null;
        } = {}): void =>
        {
            getStringSpy.mockImplementation(name => strings[name] ?? null);
            getIntegerSpy.mockReturnValue(baseStatTotal);
            getBooleanSpy.mockReturnValue(includeContestInfo);
        };

        /** Makes the stubbed lookup return the given Pokemon, and returns the same data for assertions */
        const arrangeFoundPokemon = (
            overrides: Parameters<typeof createPtuPokemonDataBulk>[0],
        ): PtuPokemonForLookupPokemon[] =>
        {
            const pokemon = createPtuPokemonDataBulk(overrides);
            getLookupDataSpy.mockResolvedValue(pokemon);
            return pokemon;
        };

        beforeEach(() =>
        {
            commandName = `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Pokemon}`;
            interaction = new FakeChatInputCommandInteraction();
            strategies = {
                [PtuSubcommandGroup.Lookup]: {
                    [PtuLookupSubcommand.Move]: LookupMoveStrategy,
                    [PtuLookupSubcommand.Ability]: LookupAbilityStrategy,
                },
            } as unknown as PtuStrategyMap;

            getStringSpy = jest.spyOn(interaction.options, 'getString').mockReturnValue(null);
            getIntegerSpy = jest.spyOn(interaction.options, 'getInteger').mockReturnValue(null);
            getBooleanSpy = jest.spyOn(interaction.options, 'getBoolean').mockReturnValue(null);
            // getLookupData calls MongoDB and image services, so it is stubbed whole and never runs
            getLookupDataSpy = jest.spyOn(LookupPokemonStrategy, 'getLookupData').mockResolvedValue([]);
            getMoveLookupDataSpy = jest.spyOn(LookupMoveStrategy, 'getLookupData').mockResolvedValue([]);
            getAbilityLookupDataSpy = jest.spyOn(LookupAbilityStrategy, 'getLookupData').mockResolvedValue([]);
            paginationRunSpy = jest.spyOn(PaginationStrategy, 'run').mockResolvedValue(getFakeMessage());
        });

        describe('when the search options are invalid', () =>
        {
            describe('when more than one search option is given', () =>
            {
                it.each<[
                    given: string,
                    strings: Record<string, string>,
                    baseStatTotal: number | null,
                ]>([
                    // First Parameter: Name
                    ['a name and a move', { [PtuAutocompleteParameterName.PokemonName]: 'Pikachu', [PtuAutocompleteParameterName.MoveName]: 'Tackle' }, null],
                    ['a name and an ability', { [PtuAutocompleteParameterName.PokemonName]: 'Pikachu', [PtuAutocompleteParameterName.AbilityName]: 'Static' }, null],
                    ['a name and a capability', { [PtuAutocompleteParameterName.PokemonName]: 'Pikachu', [PtuAutocompleteParameterName.CapabilityName]: 'Telekinetic' }, null],
                    ['a name and egg groups', { [PtuAutocompleteParameterName.PokemonName]: 'Pikachu', [PtuAutocompleteParameterName.EggGroup1]: 'Field' }, null],
                    ['a name and a base stat total', { [PtuAutocompleteParameterName.PokemonName]: 'Pikachu' }, 300],
                    // First Parameter: Move
                    ['a move and an ability', { [PtuAutocompleteParameterName.MoveName]: 'Tackle', [PtuAutocompleteParameterName.AbilityName]: 'Static' }, null],
                    ['a move and a capability', { [PtuAutocompleteParameterName.MoveName]: 'Tackle', [PtuAutocompleteParameterName.CapabilityName]: 'Telekinetic' }, null],
                    ['a move and egg groups', { [PtuAutocompleteParameterName.MoveName]: 'Tackle', [PtuAutocompleteParameterName.EggGroup1]: 'Field' }, null],
                    ['a move and a base stat total', { [PtuAutocompleteParameterName.MoveName]: 'Tackle' }, 300],
                    // First Parameter: Ability
                    ['an ability and a capability', { [PtuAutocompleteParameterName.AbilityName]: 'Static', [PtuAutocompleteParameterName.CapabilityName]: 'Telekinetic' }, null],
                    ['an ability and egg groups', { [PtuAutocompleteParameterName.AbilityName]: 'Static', [PtuAutocompleteParameterName.EggGroup1]: 'Field' }, null],
                    ['an ability and a base stat total', { [PtuAutocompleteParameterName.AbilityName]: 'Static' }, 300],
                    // First Parameter: Capability
                    ['a capability and egg groups', { [PtuAutocompleteParameterName.CapabilityName]: 'Telekinetic', [PtuAutocompleteParameterName.EggGroup1]: 'Field' }, null],
                    ['a capability and a base stat total', { [PtuAutocompleteParameterName.CapabilityName]: 'Telekinetic' }, 300],
                    // First Parameter: Egg Groups
                    ['egg groups and a base stat total', { [PtuAutocompleteParameterName.EggGroup1]: 'Field' }, 300],
                ])('should reply with an error message that only one search option can be used when %s are given', async (_given, strings, baseStatTotal) =>
                {
                    // Arrange
                    mockOptions({ strings, baseStatTotal });

                    // Act
                    await LookupPokemonStrategy.run(interaction, strategies);

                    // Assert
                    expect(paginationRunSpy).toHaveBeenCalledWith({
                        originalInteraction: interaction,
                        commandName,
                        content: ERROR_MESSAGES.tooManySearchOptions,
                        includeDeleteButton: true,
                    });
                    expect(getLookupDataSpy).not.toHaveBeenCalled();
                });

                // Habitat & Diet
                it.each<[
                    given: string,
                    strings: Record<string, string>,
                    baseStatTotal: number | null,
                ]>([
                    ['a habitat, a diet, and a name', {
                        habitat_name: 'Forest', diet_name: 'Herbivore', [PtuAutocompleteParameterName.PokemonName]: 'Pikachu',
                    }, null],
                    ['a habitat, a diet, and a move', {
                        habitat_name: 'Forest', diet_name: 'Herbivore', [PtuAutocompleteParameterName.MoveName]: 'Tackle',
                    }, null],
                    ['a habitat, a diet, and an ability', {
                        habitat_name: 'Forest', diet_name: 'Herbivore', [PtuAutocompleteParameterName.AbilityName]: 'Static',
                    }, null],
                    ['a habitat, a diet, and a capability', {
                        habitat_name: 'Forest', diet_name: 'Herbivore', [PtuAutocompleteParameterName.CapabilityName]: 'Telekinetic',
                    }, null],
                    ['a habitat, a diet, and egg groups', {
                        habitat_name: 'Forest', diet_name: 'Herbivore', [PtuAutocompleteParameterName.EggGroup1]: 'Field',
                    }, null],
                    ['a habitat, a diet, and a base stat total', { habitat_name: 'Forest', diet_name: 'Herbivore' }, 300],
                ])('should reply with an error message that only one search option can be used when %s are given', async (_given, strings, baseStatTotal) =>
                {
                    // Arrange
                    mockOptions({ strings, baseStatTotal });

                    // Act
                    await LookupPokemonStrategy.run(interaction, strategies);

                    // Assert
                    expect(paginationRunSpy).toHaveBeenCalledWith({
                        originalInteraction: interaction,
                        commandName,
                        content: ERROR_MESSAGES.tooManySearchOptions,
                        includeDeleteButton: true,
                    });
                    expect(getLookupDataSpy).not.toHaveBeenCalled();
                });

                // Just habitat and no diet, with something else
                it.each<[
                    given: string,
                    strings: Record<string, string>,
                    baseStatTotal: number | null,
                ]>([
                    ['a habitat and a name', { habitat_name: 'Forest', [PtuAutocompleteParameterName.PokemonName]: 'Pikachu' }, null],
                    ['a habitat and a move', { habitat_name: 'Forest', [PtuAutocompleteParameterName.MoveName]: 'Tackle' }, null],
                    ['a habitat and an ability', { habitat_name: 'Forest', [PtuAutocompleteParameterName.AbilityName]: 'Static' }, null],
                    ['a habitat and a capability', { habitat_name: 'Forest', [PtuAutocompleteParameterName.CapabilityName]: 'Telekinetic' }, null],
                    ['a habitat and egg groups', { habitat_name: 'Forest', [PtuAutocompleteParameterName.EggGroup1]: 'Field' }, null],
                    ['a habitat and a base stat total', { habitat_name: 'Forest' }, 300],
                ])('should reply with an error message that only one search option can be used when %s are given', async (_given, strings, baseStatTotal) =>
                {
                    // Arrange
                    mockOptions({ strings, baseStatTotal });

                    // Act
                    await LookupPokemonStrategy.run(interaction, strategies);

                    // Assert
                    expect(paginationRunSpy).toHaveBeenCalledWith({
                        originalInteraction: interaction,
                        commandName,
                        content: ERROR_MESSAGES.tooManySearchOptions,
                        includeDeleteButton: true,
                    });
                    expect(getLookupDataSpy).not.toHaveBeenCalled();
                });

                // Just diet and no habitat, with something else
                it.each<[
                    given: string,
                    strings: Record<string, string>,
                    baseStatTotal: number | null,
                ]>([
                    ['a diet and a name', { diet_name: 'Herbivore', [PtuAutocompleteParameterName.PokemonName]: 'Pikachu' }, null],
                    ['a diet and a move', { diet_name: 'Herbivore', [PtuAutocompleteParameterName.MoveName]: 'Tackle' }, null],
                    ['a diet and an ability', { diet_name: 'Herbivore', [PtuAutocompleteParameterName.AbilityName]: 'Static' }, null],
                    ['a diet and a capability', { diet_name: 'Herbivore', [PtuAutocompleteParameterName.CapabilityName]: 'Telekinetic' }, null],
                    ['a diet and egg groups', { diet_name: 'Herbivore', [PtuAutocompleteParameterName.EggGroup1]: 'Field' }, null],
                    ['a diet and a base stat total', { diet_name: 'Herbivore' }, 300],
                ])('should reply with an error message that only one search option can be used when %s are given', async (_given, strings, baseStatTotal) =>
                {
                    // Arrange
                    mockOptions({ strings, baseStatTotal });

                    // Act
                    await LookupPokemonStrategy.run(interaction, strategies);

                    // Assert
                    expect(paginationRunSpy).toHaveBeenCalledWith({
                        originalInteraction: interaction,
                        commandName,
                        content: ERROR_MESSAGES.tooManySearchOptions,
                        includeDeleteButton: true,
                    });
                    expect(getLookupDataSpy).not.toHaveBeenCalled();
                });

                // Just habitat or diet and not the other, with two of something else
                it.each<[
                    given: string,
                    strings: Record<string, string>,
                ]>([
                    ['a habitat, a name, and a move', {
                        habitat_name: 'Forest', [PtuAutocompleteParameterName.PokemonName]: 'Pikachu', [PtuAutocompleteParameterName.MoveName]: 'Tackle',
                    }],
                    ['a diet, a name, and a move', {
                        diet_name: 'Herbivore', [PtuAutocompleteParameterName.PokemonName]: 'Pikachu', [PtuAutocompleteParameterName.MoveName]: 'Tackle',
                    }],
                ])('should reply with an error message that only one search option can be used when %s are given', async (_given, strings) =>
                {
                    // Arrange
                    mockOptions({ strings });

                    // Act
                    await LookupPokemonStrategy.run(interaction, strategies);

                    // Assert
                    expect(paginationRunSpy).toHaveBeenCalledWith({
                        originalInteraction: interaction,
                        commandName,
                        content: ERROR_MESSAGES.tooManySearchOptions,
                        includeDeleteButton: true,
                    });
                    expect(getLookupDataSpy).not.toHaveBeenCalled();
                });
            });

            it('should reply with an error message that a search option is required when none is given', async () =>
            {
                // Arrange
                mockOptions();

                // Act
                await LookupPokemonStrategy.run(interaction, strategies);

                // Assert
                expect(paginationRunSpy).toHaveBeenCalledWith({
                    originalInteraction: interaction,
                    commandName,
                    content: ERROR_MESSAGES.noSearchOption,
                    includeDeleteButton: true,
                });
                expect(getLookupDataSpy).not.toHaveBeenCalled();
            });
        });

        describe('when no Pokemon are found', () =>
        {
            describe('when searching by move', () =>
            {
                it('should reply with the "No Pokemon were found." error message and not throw when the move is not in the sheet', async () =>
                {
                    // Arrange
                    mockOptions({ strings: { [PtuAutocompleteParameterName.MoveName]: 'Tackel' } });
                    getMoveLookupDataSpy.mockResolvedValue([]);

                    // Act
                    const result = await LookupPokemonStrategy.run(interaction, strategies);

                    // Assert
                    expect(result).toEqual(true);
                    expect(paginationRunSpy).toHaveBeenCalledTimes(1);
                    expect(paginationRunSpy).toHaveBeenCalledWith(
                        expect.objectContaining({
                            originalInteraction: interaction,
                            commandName,
                            content: ERROR_MESSAGES.noPokemonFound,
                            includeDeleteButton: true,
                        }),
                    );
                });

                it('should reply with the "No Pokemon were found." error message and the move button row when the move exists but no Pokemon have it', async () =>
                {
                    // Arrange
                    const moveName = 'Tackle';
                    mockOptions({ strings: { [PtuAutocompleteParameterName.MoveName]: moveName } });
                    getMoveLookupDataSpy.mockResolvedValue([createPtuMoveData({ name: moveName })]);

                    // Act
                    await LookupPokemonStrategy.run(interaction, strategies);

                    // Assert
                    expect(paginationRunSpy).toHaveBeenCalledTimes(1);
                    expect(paginationRunSpy).toHaveBeenCalledWith(
                        expect.objectContaining({
                            originalInteraction: interaction,
                            commandName,
                            content: ERROR_MESSAGES.noPokemonFound,
                            includeDeleteButton: true,
                        }),
                    );
                    expect(getMoveLookupDataSpy).toHaveBeenCalledWith({ names: [moveName] });
                    expect(paginationRunSpy).toHaveBeenCalledWith(
                        expect.objectContaining({
                            rowsAbovePagination: [undefined, undefined, expect.any(LookupPokemonActionRowBuilder) as unknown],
                        }),
                    );
                });
            });

            it('should reply with the "No Pokemon were found." error message and not throw when a name finds nothing', async () =>
            {
                // Arrange
                mockOptions({ strings: { [PtuAutocompleteParameterName.PokemonName]: 'Pikachuu' } });

                // Act
                const result = await LookupPokemonStrategy.run(interaction, strategies);

                // Assert
                expect(result).toEqual(true);
                expect(paginationRunSpy).toHaveBeenCalledTimes(1);
                expect(paginationRunSpy).toHaveBeenCalledWith({
                    originalInteraction: interaction,
                    commandName,
                    content: ERROR_MESSAGES.noPokemonFound,
                    includeDeleteButton: true,
                    rowsAbovePagination: [undefined, undefined, undefined],
                    onRowAbovePaginationButtonPress: expect.any(Function) as unknown,
                });
            });

            it('should reply with the "No Pokemon were found." error message and not throw when the ability is not in the sheet', async () =>
            {
                // Arrange
                mockOptions({ strings: { [PtuAutocompleteParameterName.AbilityName]: 'Overgrwoth' } });
                getAbilityLookupDataSpy.mockResolvedValue([]);

                // Act
                const result = await LookupPokemonStrategy.run(interaction, strategies);

                // Assert
                expect(result).toEqual(true);
                expect(paginationRunSpy).toHaveBeenCalledTimes(1);
                expect(paginationRunSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        originalInteraction: interaction,
                        commandName,
                        content: ERROR_MESSAGES.noPokemonFound,
                        includeDeleteButton: true,
                    }),
                );
            });

            it.each<[
                searchedBy: string,
                options: Parameters<typeof mockOptions>[0],
            ]>([
                ['a capability', { strings: { [PtuAutocompleteParameterName.CapabilityName]: 'Nonexistent' } }],
                ['egg groups', { strings: { [PtuAutocompleteParameterName.EggGroup1]: 'Field', [PtuAutocompleteParameterName.EggGroup2]: 'Water 1' } }],
                ['a habitat', { strings: { habitat_name: 'Forest' } }],
                ['a diet', { strings: { diet_name: 'Herbivore' } }],
                ['a base stat total', { baseStatTotal: 1 }],
            ])('should reply with the "No Pokemon were found." error message instead of a header-only results embed when %s finds nothing', async (_searchedBy, options) =>
            {
                // Arrange
                mockOptions(options);

                // Act
                const result = await LookupPokemonStrategy.run(interaction, strategies);

                // Assert
                expect(result).toEqual(true);
                expect(paginationRunSpy).toHaveBeenCalledTimes(1);
                expect(paginationRunSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        originalInteraction: interaction,
                        commandName,
                        content: ERROR_MESSAGES.noPokemonFound,
                        includeDeleteButton: true,
                    }),
                );
            });

            it('should not look up move details for contest info when `includeContestInfo` is set and nothing is found', async () =>
            {
                // Arrange
                mockOptions({
                    strings: { [PtuAutocompleteParameterName.CapabilityName]: 'Nonexistent' },
                    includeContestInfo: true,
                });

                // Act
                await LookupPokemonStrategy.run(interaction, strategies);

                // Assert
                expect(getMoveLookupDataSpy).not.toHaveBeenCalled();
            });

            it('should keep the delete button and interaction type on the error message when nothing is found', async () =>
            {
                // Arrange
                const buttonInteraction = getFakeButtonInteraction();

                // Act
                await LookupPokemonStrategy.run(buttonInteraction, strategies, {
                    capabilityName: 'Nonexistent',
                    interactionType: 'followUp',
                });

                // Assert
                expect(paginationRunSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        originalInteraction: buttonInteraction,
                        commandName,
                        content: ERROR_MESSAGES.noPokemonFound,
                        includeDeleteButton: true,
                        interactionType: 'followUp',
                    }),
                );
            });
        });

        describe('when Pokemon are found', () =>
        {
            describe('when searching by name', () =>
            {
                it('should reply with the lookup results, not an error message, when a name finds one Pokemon', async () =>
                {
                    // Arrange
                    const [pokemon] = arrangeFoundPokemon([{}]);
                    mockOptions({ strings: { [PtuAutocompleteParameterName.PokemonName]: pokemon.name } });

                    // Act
                    await LookupPokemonStrategy.run(interaction, strategies);

                    // Assert
                    expect(paginationRunSpy).toHaveBeenCalledTimes(1);
                    expect(paginationRunSpy).toHaveBeenCalledWith(
                        expect.objectContaining({
                            embeds: [embedDescribing(pokemon.name)],
                        }),
                    );
                    expect(paginationRunSpy).not.toHaveBeenCalledWith(
                        expect.objectContaining({
                            content: ERROR_MESSAGES.noPokemonFound,
                        }),
                    );
                });

                it('should reply with a lookup results embed for each Pokemon, in order, when a name finds more than one Pokemon', async () =>
                {
                    // Arrange
                    const [bulbasaur, charmander] = arrangeFoundPokemon([{ name: 'Bulbasaur' }, { name: 'Charmander' }]);
                    mockOptions({ strings: { [PtuAutocompleteParameterName.PokemonName]: bulbasaur.name } });

                    // Act
                    await LookupPokemonStrategy.run(interaction, strategies);

                    // Assert
                    expect(paginationRunSpy).toHaveBeenCalledTimes(1);
                    expect(paginationRunSpy).toHaveBeenCalledWith(
                        expect.objectContaining({
                            embeds: [embedDescribing(bulbasaur.name), embedDescribing(charmander.name)],
                        }),
                    );
                    expect(paginationRunSpy).not.toHaveBeenCalledWith(
                        expect.objectContaining({
                            content: ERROR_MESSAGES.noPokemonFound,
                        }),
                    );
                });
            });

            describe('when searching by move', () =>
            {
                const getLevelUpMoveList = (moves: { move: string; level: number }[]): ReturnType<typeof createPtuPokemonData>['moveList'] => ({
                    levelUp: moves.map(({ move, level }) => ({
                        move, level, type: 'Normal',
                    })),
                    tmHm: [],
                    eggMoves: [],
                    tutorMoves: [],
                });

                it('should reply with results listing the Pokemon that learn the move by level-up', async () =>
                {
                    // Arrange
                    const moveName = 'Tackle';
                    const [pokemon] = arrangeFoundPokemon([{
                        name: 'Bulbasaur',
                        moveList: getLevelUpMoveList([{ move: moveName, level: 5 }]),
                    }]);
                    mockOptions({ strings: { [PtuAutocompleteParameterName.MoveName]: moveName } });

                    // Act
                    await LookupPokemonStrategy.run(interaction, strategies);

                    // Assert
                    expect(paginationRunSpy).toHaveBeenCalledTimes(1);
                    expect(paginationRunSpy).toHaveBeenCalledWith(
                        expect.objectContaining({
                            embeds: [embedDescribing(
                                `Pokemon that can learn ${moveName} as a Level-Up Move`,
                                pokemon.name,
                            )],
                        }),
                    );
                    expect(paginationRunSpy).not.toHaveBeenCalledWith(
                        expect.objectContaining({
                            content: ERROR_MESSAGES.noPokemonFound,
                        }),
                    );
                });

                it('should reply with results listing Pokemon that learn the move at a lower level before those that learn it at a higher level', async () =>
                {
                    // Arrange
                    const moveName = 'Tackle';
                    const [higherLevel, lowerLevel] = arrangeFoundPokemon([
                        { name: 'Charmander', moveList: getLevelUpMoveList([{ move: moveName, level: 20 }]) },
                        { name: 'Bulbasaur', moveList: getLevelUpMoveList([{ move: moveName, level: 5 }]) },
                    ]);
                    mockOptions({ strings: { [PtuAutocompleteParameterName.MoveName]: moveName } });

                    // Act
                    await LookupPokemonStrategy.run(interaction, strategies);

                    // Assert
                    expect(paginationRunSpy).toHaveBeenCalledTimes(1);
                    expect(paginationRunSpy).toHaveBeenCalledWith(
                        expect.objectContaining({
                            embeds: [embedDescribing(new RegExp(`${lowerLevel.name}[\\s\\S]*${higherLevel.name}`))],
                        }),
                    );
                    expect(paginationRunSpy).not.toHaveBeenCalledWith(
                        expect.objectContaining({
                            content: ERROR_MESSAGES.noPokemonFound,
                        }),
                    );
                });

                it('should reply with results from the next move list type when no Pokemon learn the move by level-up', async () =>
                {
                    // Arrange
                    const moveName = 'Tackle';
                    const [pokemon] = arrangeFoundPokemon([{
                        name: 'Bulbasaur',
                        moveList: {
                            levelUp: [],
                            tmHm: [],
                            eggMoves: [moveName],
                            tutorMoves: [],
                        },
                    }]);
                    mockOptions({ strings: { [PtuAutocompleteParameterName.MoveName]: moveName } });

                    // Act
                    await LookupPokemonStrategy.run(interaction, strategies);

                    // Assert
                    expect(paginationRunSpy).toHaveBeenCalledTimes(1);
                    expect(paginationRunSpy).toHaveBeenCalledWith(
                        expect.objectContaining({
                            embeds: [embedDescribing(
                                `Pokemon that can learn ${moveName} as an Egg Move`,
                                pokemon.name,
                            )],

                        }),
                    );
                    expect(paginationRunSpy).not.toHaveBeenCalledWith(
                        expect.objectContaining({
                            content: ERROR_MESSAGES.noPokemonFound,
                        }),
                    );
                });
            });

            describe('when searching by capability, egg groups, habitat, diet, or base stat total', () =>
            {
                it('should reply with the list of Pokemon, not an error message, when a capability finds a Pokemon', async () =>
                {
                    // Arrange
                    const [pokemon] = arrangeFoundPokemon([{}]);
                    mockOptions({ strings: { [PtuAutocompleteParameterName.CapabilityName]: 'Telekinetic' } });

                    // Act
                    await LookupPokemonStrategy.run(interaction, strategies);

                    // Assert
                    // The capability embed is a header plus one line per found Pokemon, so the name appearing means the list was built
                    expect(paginationRunSpy).toHaveBeenCalledTimes(1);
                    expect(paginationRunSpy).toHaveBeenCalledWith(
                        expect.objectContaining({
                            embeds: [embedDescribing(pokemon.name)],
                        }),
                    );
                    expect(paginationRunSpy).not.toHaveBeenCalledWith(
                        expect.objectContaining({
                            content: ERROR_MESSAGES.noPokemonFound,
                        }),
                    );
                });

                it.each<[
                    searchedBy: string,
                    options: Parameters<typeof mockOptions>[0],
                    header: string,
                ]>([
                    ['a capability', { strings: { [PtuAutocompleteParameterName.CapabilityName]: 'Telekinetic' } }, 'Pokemon that have the Telekinetic Capability'],
                    ['egg groups', { strings: { [PtuAutocompleteParameterName.EggGroup1]: 'Field', [PtuAutocompleteParameterName.EggGroup2]: 'Water 1' } }, 'Pokemon that have the Field & Water 1 Egg Groups'],
                    ['a habitat', { strings: { habitat_name: 'Forest' } }, 'Pokemon that have the Forest Habitat'],
                    ['a diet', { strings: { diet_name: 'Herbivore' } }, 'Pokemon that have the Herbivore Diet'],
                    ['a base stat total', { baseStatTotal: 300 }, 'Pokemon that have a Base Stat Total of 300'],
                ])('should reply with results listing every Pokemon under the search header when %s finds more than one Pokemon', async (_searchedBy, options, header) =>
                {
                    // Arrange
                    const [first, second] = arrangeFoundPokemon([{ name: 'Bulbasaur' }, { name: 'Charmander' }]);
                    mockOptions(options);

                    // Act
                    await LookupPokemonStrategy.run(interaction, strategies);

                    // Assert
                    expect(paginationRunSpy).toHaveBeenCalledTimes(1);
                    expect(paginationRunSpy).toHaveBeenCalledWith(
                        expect.objectContaining({
                            embeds: [embedDescribing(header, first.name, second.name)],
                        }),
                    );
                    expect(paginationRunSpy).not.toHaveBeenCalledWith(
                        expect.objectContaining({
                            content: ERROR_MESSAGES.noPokemonFound,
                        }),
                    );
                });

                it('should reply with results listing every Pokemon under the habitat and diet header when both are given', async () =>
                {
                    // Arrange
                    const [first, second] = arrangeFoundPokemon([{ name: 'Bulbasaur' }, { name: 'Charmander' }]);
                    mockOptions({
                        strings: {
                            habitat_name: 'Forest',
                            diet_name: 'Herbivore',
                        },
                    });

                    // Act
                    await LookupPokemonStrategy.run(interaction, strategies);

                    // Assert
                    expect(paginationRunSpy).toHaveBeenCalledTimes(1);
                    expect(paginationRunSpy).toHaveBeenCalledWith(
                        expect.objectContaining({
                            embeds: [embedDescribing('Pokemon that have the Forest Habitat & Herbivore Diet', first.name, second.name)],
                        }),
                    );
                    expect(paginationRunSpy).not.toHaveBeenCalledWith(
                        expect.objectContaining({
                            content: ERROR_MESSAGES.noPokemonFound,
                        }),
                    );
                });
            });

            it('should reply with results listing each Pokemon under the type of ability it has when an ability finds more than one Pokemon', async () =>
            {
                // Arrange
                const abilityName = 'Overgrow';
                const [basic, advanced] = arrangeFoundPokemon([
                    {
                        name: 'Bulbasaur',
                        abilities: {
                            basicAbilities: [abilityName], advancedAbilities: [], highAbility: 'Chlorophyll',
                        },
                    },
                    {
                        name: 'Charmander',
                        abilities: {
                            basicAbilities: [], advancedAbilities: [abilityName], highAbility: 'Solar Power',
                        },
                    },
                ]);
                mockOptions({ strings: { [PtuAutocompleteParameterName.AbilityName]: abilityName } });

                // Act
                await LookupPokemonStrategy.run(interaction, strategies);

                // Assert
                expect(paginationRunSpy).toHaveBeenCalledTimes(1);
                expect(paginationRunSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        embeds: [embedDescribing(
                            `Pokemon that can learn ${abilityName}`,
                            new RegExp(`Learn as Basic Ability:[\\s*]*${basic.name}`),
                            new RegExp(`Learn as Advanced Ability:[\\s*]*${advanced.name}`),
                        )],
                    }),
                );
                expect(paginationRunSpy).not.toHaveBeenCalledWith(
                    expect.objectContaining({
                        content: ERROR_MESSAGES.noPokemonFound,
                    }),
                );
            });

            it('should look up move details for contest info when `includeContestInfo` is set and Pokemon are found', async () =>
            {
                // Arrange
                arrangeFoundPokemon([{
                    moveList: {
                        levelUp: [{
                            move: 'Tackle', level: 5, type: 'Normal',
                        }],
                        tmHm: ['06 Toxic'],
                        eggMoves: ['Growl'],
                        tutorMoves: ['Swift (N)'],
                    },
                }]);
                mockOptions({
                    strings: { [PtuAutocompleteParameterName.CapabilityName]: 'Telekinetic' },
                    includeContestInfo: true,
                });

                // Act
                await LookupPokemonStrategy.run(interaction, strategies);

                // Assert
                expect(getMoveLookupDataSpy).toHaveBeenCalledTimes(1);
                // TM numbers and the "(N)" tutor marker are removed from the move names
                expect(getMoveLookupDataSpy).toHaveBeenCalledWith({ names: ['Growl', 'Tackle', 'Toxic', 'Swift'] });
            });
        });
    });
});
