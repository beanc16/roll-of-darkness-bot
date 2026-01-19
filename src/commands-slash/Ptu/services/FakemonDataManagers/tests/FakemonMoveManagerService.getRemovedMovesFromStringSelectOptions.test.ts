/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { ComponentType, StringSelectMenuComponent } from 'discord.js';

import { getArrayOfWords } from '../../../../../fakes/arrays';
import { getFakeButtonActionRowBuilder, getFakeStringSelectMenuActionRowBuilder } from '../../../../../fakes/discord/builders';
import { FakeStringSelectMenuInteraction } from '../../../../../fakes/discord/interactions';
import { FakemonMovesStringSelectCustomIds } from '../../../components/fakemon/actionRowBuilders/moves/types';
import { FakemonMoveManagerService } from '../FakemonMoveManagerService';

jest.mock('../../../dal/PtuFakemonController');
jest.mock('../../../dal/PtuFakemonPseudoCache', () =>
{
    return {
        PtuFakemonPseudoCache: {
            update: jest.fn(),
        },
    };
});

const generateCustomIdVariants = (customId: FakemonMovesStringSelectCustomIds): string[] => Array.from({ length: 3 }, (_, index) =>
    `${customId}${index}`,
);

// Production code will make it so this will never be more than 3
const removeEggMovesCustomIds = generateCustomIdVariants(FakemonMovesStringSelectCustomIds.RemoveEggMoves);
const removeTmHmMovesCustomIds = generateCustomIdVariants(FakemonMovesStringSelectCustomIds.RemoveTmHmMoves);
const removeTutorMovesCustomIds = generateCustomIdVariants(FakemonMovesStringSelectCustomIds.RemoveTutorMoves);
const oneTo25 = Array.from({ length: 25 }, (_, index) => index + 1);

const customIdToVariants: Record<string, string[]> = {
    [FakemonMovesStringSelectCustomIds.RemoveEggMoves]: removeEggMovesCustomIds,
    [FakemonMovesStringSelectCustomIds.RemoveTmHmMoves]: removeTmHmMovesCustomIds,
    [FakemonMovesStringSelectCustomIds.RemoveTutorMoves]: removeTutorMovesCustomIds,
};

const getStringInteractionForRemovingMoves = (baseCustomId: FakemonMovesStringSelectCustomIds, options: {
    numOfRemoveDropdowns: 1 | 2 | 3;
    numOfMovesPerDropdown: Parameters<typeof getArrayOfWords>[0];
} = {
    numOfRemoveDropdowns: 1,
    numOfMovesPerDropdown: { min: 1, max: 25 },
}): { interaction: FakeStringSelectMenuInteraction; allMoveNames: string[] } =>
{
    const interaction = new FakeStringSelectMenuInteraction();
    const allMoveNames: string[] = [];

    const removeDropdowns = Array.from({ length: options.numOfRemoveDropdowns }, (_, index) =>
    {
        // Action row builder
        const actionRowBuilder = getFakeStringSelectMenuActionRowBuilder({
            customId: customIdToVariants[baseCustomId][index],
        });
        // Set move names in the dropdown
        const moveNames = getArrayOfWords(options.numOfMovesPerDropdown);
        (actionRowBuilder.components[0] as unknown as { options: object[] }).options = moveNames.map(move => ({
            label: move,
            value: move,
            default: true,
        }));
        allMoveNames.push(...moveNames);
        return actionRowBuilder;
    });

    interaction.message.components = [
        getFakeButtonActionRowBuilder(),
        ...removeDropdowns,
        getFakeButtonActionRowBuilder(),
    ] as unknown as typeof interaction.message.components;

    return { interaction, allMoveNames };
};

const getCurrentComponent = (interaction: FakeStringSelectMenuInteraction, customId: string): StringSelectMenuComponent | undefined =>
{
    // eslint-disable-next-line no-restricted-syntax
    for (const { components } of interaction.message.components)
    {
        // eslint-disable-next-line no-restricted-syntax
        for (const component of components)
        {
            if (component.type === ComponentType.StringSelect && component.customId === customId)
            {
                return component;
            }
        }
    }

    return undefined;
};

const getExpectedRemovedOptions = (component: ReturnType<typeof getCurrentComponent>, values: string[]): string[] =>
{
    return component!.options.reduce<string[]>((acc, { value }) =>
    {
        if (!values.includes(value))
        {
            acc.push(value);
        }

        return acc;
    }, []);
};

describe(`class: ${FakemonMoveManagerService.name}`, () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });

    describe(`method: ${FakemonMoveManagerService.getRemovedMovesFromStringSelectOptions.name}`, () =>
    {
        describe.each([
            [removeEggMovesCustomIds[0], FakemonMovesStringSelectCustomIds.RemoveEggMoves, [1, 2, 3]],
            [removeEggMovesCustomIds[1], FakemonMovesStringSelectCustomIds.RemoveEggMoves, [2, 3]],
            [removeEggMovesCustomIds[2], FakemonMovesStringSelectCustomIds.RemoveEggMoves, [3]],
            [removeTmHmMovesCustomIds[0], FakemonMovesStringSelectCustomIds.RemoveTmHmMoves, [1, 2, 3]],
            [removeTmHmMovesCustomIds[1], FakemonMovesStringSelectCustomIds.RemoveTmHmMoves, [2, 3]],
            [removeTmHmMovesCustomIds[2], FakemonMovesStringSelectCustomIds.RemoveTmHmMoves, [3]],
            [removeTutorMovesCustomIds[0], FakemonMovesStringSelectCustomIds.RemoveTutorMoves, [1, 2, 3]],
            [removeTutorMovesCustomIds[1], FakemonMovesStringSelectCustomIds.RemoveTutorMoves, [2, 3]],
            [removeTutorMovesCustomIds[2], FakemonMovesStringSelectCustomIds.RemoveTutorMoves, [3]],
        ] as const)('customId: %s', (customId, baseCustomId, numOfDropdownsOptions) =>
        {
            describe.each(numOfDropdownsOptions)('%s remove dropdowns', (numOfRemoveDropdowns) =>
            {
                it('should only return options from other dropdowns when all options in current dropdown are selected', () =>
                {
                    // Arrange
                    const { interaction, allMoveNames } = getStringInteractionForRemovingMoves(baseCustomId, {
                        numOfRemoveDropdowns,
                        numOfMovesPerDropdown: { max: 25 },
                    });
                    const values = allMoveNames.slice(0, 25);

                    // Act
                    const result = FakemonMoveManagerService.getRemovedMovesFromStringSelectOptions({
                        interaction,
                        values,
                        customId,
                    });

                    // Assert
                    const component = getCurrentComponent(interaction, customId);
                    expect(component).toBeDefined();

                    const expectedRemovedOptions = getExpectedRemovedOptions(component, values);
                    expect(result).toEqual(expectedRemovedOptions);
                });

                it.each(oneTo25)('should return %s removed options out of 25 options', (numOfRemoved) =>
                {
                    // Arrange
                    const { interaction, allMoveNames } = getStringInteractionForRemovingMoves(baseCustomId, {
                        numOfRemoveDropdowns,
                        numOfMovesPerDropdown: { max: 25 },
                    });
                    const values = allMoveNames.slice(0, numOfRemoved);

                    // Act
                    const result = FakemonMoveManagerService.getRemovedMovesFromStringSelectOptions({
                        interaction,
                        values,
                        customId,
                    });

                    // Assert
                    const component = getCurrentComponent(interaction, customId);
                    expect(component).toBeDefined();

                    const expectedRemovedOptions = getExpectedRemovedOptions(component, values);
                    expect(result).toEqual(expectedRemovedOptions);
                });

                it.each(oneTo25)('should handle %s duplicate values in the values array', (numOfRemoved) =>
                {
                    // Arrange
                    const { interaction, allMoveNames } = getStringInteractionForRemovingMoves(baseCustomId, {
                        numOfRemoveDropdowns,
                        numOfMovesPerDropdown: { max: 25 },
                    });
                    const values = [
                        ...allMoveNames.slice(0, numOfRemoved),
                        ...allMoveNames.slice(0, numOfRemoved),
                    ];

                    // Act
                    const result = FakemonMoveManagerService.getRemovedMovesFromStringSelectOptions({
                        interaction,
                        values,
                        customId,
                    });

                    // Assert
                    const component = getCurrentComponent(interaction, customId);
                    expect(component).toBeDefined();

                    const expectedRemovedOptions = getExpectedRemovedOptions(component, values);
                    expect(result).toEqual(expectedRemovedOptions);
                });

                it('should return all options from other dropdowns when values array is empty', () =>
                {
                    // Arrange
                    const { interaction, allMoveNames } = getStringInteractionForRemovingMoves(baseCustomId, {
                        numOfRemoveDropdowns,
                        numOfMovesPerDropdown: { max: 25 },
                    });
                    const values: string[] = [];

                    // Act
                    const result = FakemonMoveManagerService.getRemovedMovesFromStringSelectOptions({
                        interaction,
                        values,
                        customId,
                    });

                    // Assert
                    const startIndex = customIdToVariants[baseCustomId].indexOf(customId) * 25;
                    const expectedRemovedOptions = allMoveNames.slice(startIndex, startIndex + 25);
                    expect(result).toEqual(expectedRemovedOptions);
                });
            });
        });

        it('should throw if component is not a string select menu', () =>
        {
            // Arrange
            const { interaction, allMoveNames } = getStringInteractionForRemovingMoves(FakemonMovesStringSelectCustomIds.RemoveEggMoves, {
                numOfRemoveDropdowns: 1,
                numOfMovesPerDropdown: { max: 25 },
            });
            const values = allMoveNames.slice(0, 25);

            // Act & Assert
            expect(() =>
                FakemonMoveManagerService.getRemovedMovesFromStringSelectOptions({
                    interaction,
                    values,
                    customId: interaction.message.components[0].components[0].customId!,
                }),
            ).toThrow('Component is not a string select menu');
        });
    });
});
