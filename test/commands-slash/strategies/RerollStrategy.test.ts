import type { ButtonInteraction, Message } from 'discord.js';

import { ButtonStrategy, HandleButtonInteractionsOptions } from '../../../src/commands-slash/strategies/ButtonStrategy.js';
import { RerollInteractionCallbackType, RerollStrategy } from '../../../src/commands-slash/strategies/RerollStrategy.js';
import { CommandName, DiscordInteractionCallbackType } from '../../../src/types/discord.js';
import { getFakeButtonInteraction } from '../../fakes/discord/interactions.js';

describe('class: RerollStrategy', () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();

        jest.spyOn(ButtonStrategy, 'getMessageData').mockImplementation(() =>
        {
            return {
                content: 'fake-content',
                components: [],
            };
        });
    });

    describe('method: run', () =>
    {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow for testing purposes
        let spyOnHandleButtonInteractions: jest.SpyInstance<Promise<void>, [HandleButtonInteractionsOptions], any>;
        const commandName: CommandName = '/fake_command';
        let interaction: ButtonInteraction;
        let onRerollCallback: jest.Mock;

        beforeEach(() =>
        {
            onRerollCallback = jest.fn();
            interaction = getFakeButtonInteraction();
            spyOnHandleButtonInteractions = jest.spyOn(ButtonStrategy, 'handleButtonInteractions').mockImplementation();
        });

        describe.each([
            [DiscordInteractionCallbackType.EditReply, [
                DiscordInteractionCallbackType.Followup,
                DiscordInteractionCallbackType.Update,
            ]],
            [DiscordInteractionCallbackType.Followup, [
                DiscordInteractionCallbackType.EditReply,
                DiscordInteractionCallbackType.Update,
            ]],
            [DiscordInteractionCallbackType.Update, [
                DiscordInteractionCallbackType.EditReply,
                DiscordInteractionCallbackType.Followup,
            ]],
        ] as [RerollInteractionCallbackType, RerollInteractionCallbackType[]][])('DiscordInteractionCallbackType: %s', (interactionCallbackType, interactionCallbackTypesToNotCall) =>
        {
            it(`should call interaction.${interactionCallbackType}`, async () =>
            {
                const spyOnInteractionMethodBasedOnType = jest.spyOn(interaction, interactionCallbackType);
                const spyOnInteractionMethodsToNotCall = interactionCallbackTypesToNotCall.map((interactionCallbackTypeToNotCall) =>
                {
                    const output = jest.spyOn(
                        interaction,
                        interactionCallbackTypeToNotCall,
                    );

                    return output;
                });

                await RerollStrategy.run({
                    interaction,
                    options: {},
                    rerollCallbackOptions: {
                        interactionCallbackType,
                    },
                    onRerollCallback,
                    commandName,
                });

                expect(spyOnInteractionMethodBasedOnType).toHaveBeenCalledTimes(1);

                spyOnInteractionMethodsToNotCall.forEach((interactionMethodToNotCall) =>
                {
                    expect(interactionMethodToNotCall).not.toHaveBeenCalled();
                });
            });

            it('should call ButtonStrategy.handleButtonInteractions', async () =>
            {
                await RerollStrategy.run({
                    interaction,
                    options: {},
                    rerollCallbackOptions: {
                        interactionCallbackType,
                    },
                    onRerollCallback,
                    commandName,
                });

                expect(spyOnHandleButtonInteractions).toHaveBeenCalledTimes(1);
            });

            /* eslint-disable jest/no-conditional-expect */ // Ignore for this one test that tests all possible outcomes
            it('should call ButtonStrategy.handleButtonInteractions with the correct interactionResponse', async () =>
            {
                const messageResponse: Message = {
                    content: 'fake-message-response-content',
                    components: [],
                } as unknown as Message;

                jest.spyOn(interaction, interactionCallbackType).mockResolvedValue(
                    messageResponse,
                );

                await RerollStrategy.run({
                    interaction,
                    options: {},
                    rerollCallbackOptions: {
                        interactionCallbackType,
                    },
                    onRerollCallback,
                    commandName,
                });

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any -- We want this to test only one parameter
                const handleButtonInteractionsCall: HandleButtonInteractionsOptions = (ButtonStrategy['handleButtonInteractions'] as any).mock.calls[0][0];

                // Similar to expect(ButtonStrategy['handleButtonInteractions']).toHaveBeenCalledWith
                // except without nonymous functions, which Jest doesn't evaluate correctly.
                if (interactionCallbackType === DiscordInteractionCallbackType.Update)
                {
                    expect(handleButtonInteractionsCall.interactionResponse).toEqual(
                        interaction.message,
                    );
                }
                else
                {
                    expect(handleButtonInteractionsCall.interactionResponse).toEqual(
                        messageResponse,
                    );
                }
            });
            /* eslint-enable jest/no-conditional-expect */
        });

        describe(`DiscordInteractionCallbackType: ${DiscordInteractionCallbackType.Followup}`, () =>
        {
            it('should still reply on a webhook timeout error', async () =>
            {
                const spyOnInteractionFollowUp = jest.spyOn(interaction, DiscordInteractionCallbackType.Followup).mockImplementation(() =>
                {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal -- This is necessary for the test
                    throw {
                        rawError: {
                            message: 'Invalid Webhook Token',
                        },
                    };
                });
                const spyOnInteractionChannelSend = jest.spyOn(interaction.channel!, 'send');

                await RerollStrategy.run({
                    interaction,
                    options: {},
                    rerollCallbackOptions: {
                        interactionCallbackType: DiscordInteractionCallbackType.Followup,
                    },
                    onRerollCallback,
                    commandName,
                });

                expect(spyOnInteractionFollowUp).toHaveBeenCalledTimes(1);
                expect(spyOnInteractionChannelSend).toHaveBeenCalledTimes(1);
            });

            it('should throw error if reply on a webhook timeout error still fails to send a new message', async () =>
            {
                const spyOnInteractionFollowUp = jest.spyOn(interaction, DiscordInteractionCallbackType.Followup).mockImplementation(() =>
                {
                    throw new Error('An intentionally thrown error');
                });

                const promise = RerollStrategy.run({
                    interaction,
                    options: {},
                    rerollCallbackOptions: {
                        interactionCallbackType: DiscordInteractionCallbackType.Followup,
                    },
                    onRerollCallback,
                    commandName,
                });

                expect(spyOnInteractionFollowUp).toHaveBeenCalledTimes(1);
                await expect(promise).rejects.toThrow('An intentionally thrown error');
            });
        });
    });

    describe('method: onRerollButtonPress', () =>
    {
        let buttonInteraction: ButtonInteraction;
        let onRerollCallback: jest.Mock;

        beforeEach(() =>
        {
            buttonInteraction = getFakeButtonInteraction();
            onRerollCallback = jest.fn();
        });

        it('should call onRerollCallback', async () =>
        {
            await RerollStrategy['onRerollButtonPress']({
                buttonInteraction,
                onRerollCallback,
                previousResponse: undefined,
            });

            expect(onRerollCallback).toHaveBeenCalledTimes(1);
        });

        it('should call buttonInteraction.update', async () =>
        {
            const spyOnButtonInteractionUpdate = jest.spyOn(buttonInteraction, 'update');

            await RerollStrategy['onRerollButtonPress']({
                buttonInteraction,
                onRerollCallback,
                previousResponse: undefined,
            });

            expect(spyOnButtonInteractionUpdate).toHaveBeenCalledTimes(1);
        });
    });
});
