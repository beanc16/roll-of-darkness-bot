import {
    FakeChatInputCommandInteraction,
    FakeStringSelectMenuInteraction,
    getFakeButtonInteraction,
    getFakeModalSubmitInteraction,
} from '../../../../../fakes/discord/interactions';
import { createPtuFakemonCollectionData } from '../../../fakes/PtuFakemonCollection.fakes';
import { FakemonInteractionManagerInteractionType, FakemonInteractionManagerService } from '../FakemonInteractionManagerService';
import { FakemonInteractionManagerPage } from '../types';

describe(`class: ${FakemonInteractionManagerService.name}`, () =>
{
    describe(`method: ${FakemonInteractionManagerService.navigateTo.name}`, () =>
    {
        let getInteractionOptionsResponse: Awaited<ReturnType<
            typeof FakemonInteractionManagerService['getInteractionOptions']
        >>;
        let getInteractionOptionsSpy: jest.SpyInstance;
        let fakemon: ReturnType<typeof createPtuFakemonCollectionData>;

        beforeEach(() =>
        {
            getInteractionOptionsResponse = { embeds: [], components: [] };
            getInteractionOptionsSpy = jest.spyOn(FakemonInteractionManagerService as any, 'getInteractionOptions')
                .mockReturnValue(getInteractionOptionsResponse);
            fakemon = createPtuFakemonCollectionData();
        });

        afterEach(() =>
        {
            jest.restoreAllMocks();
            jest.clearAllMocks();
        });

        describe.each([
            ['ButtonInteraction', () => getFakeButtonInteraction(), ['editReply', 'update']],
            ['ModalSubmitInteraction', () => getFakeModalSubmitInteraction(), ['editReply']],
            ['ChatInputCommandInteraction', () => new FakeChatInputCommandInteraction(), ['editReply']],
            ['StringSelectMenuInteraction', () => new FakeStringSelectMenuInteraction(), ['editReply', 'update']],
        ])('%s', (_, getInteraction, interactionTypes) =>
        {
            let interaction: ReturnType<typeof getInteraction>;

            beforeEach(() =>
            {
                interaction = getInteraction();
            });

            describe.each(interactionTypes as FakemonInteractionManagerInteractionType[])('interactionType: %s', (interactionType) =>
            {
                let interactionTypeSpy: jest.SpyInstance;

                beforeEach(() =>
                {
                    interactionTypeSpy = jest.spyOn(interaction, interactionType as 'editReply');
                });

                describe.each(Object.values(FakemonInteractionManagerPage))('page: %s', (page) =>
                {
                    it(`should call getInteractionOptions and interaction.${interactionType}`, async () =>
                    {
                        // Arrange
                        const args: Parameters<typeof FakemonInteractionManagerService.navigateTo>[0] = {
                            interaction,
                            interactionType,
                            fakemon,
                            page,
                        };

                        // Act
                        await FakemonInteractionManagerService.navigateTo(args);

                        // Assert
                        expect(getInteractionOptionsSpy).toHaveBeenCalledTimes(1);
                        expect(getInteractionOptionsSpy).toHaveBeenCalledWith(args);
                        expect(interactionTypeSpy).toHaveBeenCalledTimes(1);
                        expect(interactionTypeSpy).toHaveBeenCalledWith(getInteractionOptionsResponse);
                    });
                });
            });

            it(`should default to 'editReply' interactionType`, async () =>
            {
                // Arrange
                const editReplySpy = jest.spyOn(interaction, 'editReply');
                const args: Parameters<typeof FakemonInteractionManagerService.navigateTo>[0] = {
                    interaction,
                    fakemon,
                    page: FakemonInteractionManagerPage.Overview,
                };

                // Act
                await FakemonInteractionManagerService.navigateTo(args);

                // Assert
                expect(getInteractionOptionsSpy).toHaveBeenCalledTimes(1);
                expect(getInteractionOptionsSpy).toHaveBeenCalledWith(args);
                expect(editReplySpy).toHaveBeenCalledTimes(1);
                expect(editReplySpy).toHaveBeenCalledWith(getInteractionOptionsResponse);
            });

            it('should throw error for invalid interactionType', async () =>
            {
                // Act & Assert
                await expect(
                    FakemonInteractionManagerService.navigateTo({
                        interaction,
                        interactionType: 'INVALID' as FakemonInteractionManagerInteractionType,
                        fakemon,
                        page: FakemonInteractionManagerPage.Overview,
                    }),
                ).rejects.toThrow('Unhandled interactionType: INVALID');
            });

            const excludedInteractionTypes = ['editReply', 'update'].filter((interactionType) =>
                !interactionTypes.includes(interactionType),
            );

            if (excludedInteractionTypes.length > 0)
            {
                it.each(excludedInteractionTypes as FakemonInteractionManagerInteractionType[])('should throw error for interactionType: %s', async (interactionType) =>
                {
                    // Act & Assert
                    await expect(
                        FakemonInteractionManagerService.navigateTo({
                            interaction,
                            interactionType,
                            fakemon,
                            page: FakemonInteractionManagerPage.Overview,
                        }),
                    ).rejects.toThrow();
                });
            }
        });
    });

    describe(`method: ${FakemonInteractionManagerService['getInteractionOptions'].name}`, () =>
    {
        let fakemon: ReturnType<typeof createPtuFakemonCollectionData>;

        beforeEach(() =>
        {
            fakemon = createPtuFakemonCollectionData();
        });

        // Confirm that each enum value has an output
        it.each(Object.values(FakemonInteractionManagerPage))(`should return embeds and components for '%s'`, (page) =>
        {
            // Act
            const result = FakemonInteractionManagerService['getInteractionOptions']({ page, fakemon });

            // Assert
            expect(result).toEqual({
                embeds: expect.any(Array),
                components: expect.any(Array),
            });
            expect(result.embeds?.length).toBeGreaterThan(0);
            expect(result.components?.length).toBeGreaterThan(0);
        });

        // Confirm that non-enum values do not have an output
        it('should throw an error if page is not a FakemonInteractionManagerPage', () =>
        {
            // Act & Assert
            expect(() =>
                FakemonInteractionManagerService['getInteractionOptions']({
                    page: 'invalid' as FakemonInteractionManagerPage,
                    fakemon,
                }),
            ).toThrow('Unhandled page: invalid');
        });
    });
});
