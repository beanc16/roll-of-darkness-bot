import type { ButtonInteraction, Message } from 'discord.js';

import { getFakeButtonInteraction } from '../../../fakes/discord/interactions.js';
import { CommandName, DiscordInteractionCallbackType } from '../../../types/discord.js';
import { HandleInteractionsOptions, InteractionStrategy } from '../InteractionStrategy/InteractionStrategy.js';
import {
    RerollButtonName,
    type RerollInteractionCallbackType,
    RerollStrategy,
} from './RerollStrategy.js';

describe('class: RerollStrategy', () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();

        jest.spyOn(InteractionStrategy, 'getMessageData').mockImplementation(() =>
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
        let spyOnHandleInteractions: jest.SpyInstance<Promise<void>, [HandleInteractionsOptions], any>;
        const commandName: CommandName = '/fake_command';
        let interaction: ButtonInteraction;
        let onRerollCallback: jest.Mock;

        beforeEach(() =>
        {
            onRerollCallback = jest.fn();
            interaction = getFakeButtonInteraction();
            spyOnHandleInteractions = jest.spyOn(InteractionStrategy, 'handleInteractions').mockImplementation();
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

            it('should call InteractionStrategy.handleInteractions', async () =>
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

                expect(spyOnHandleInteractions).toHaveBeenCalledTimes(1);
            });

            /* eslint-disable jest/no-conditional-expect */ // Ignore for this one test that tests all possible outcomes
            it('should call InteractionStrategy.handleInteractions with the correct interactionResponse', async () =>
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
                const handleInteractionsCall: HandleInteractionsOptions = (InteractionStrategy['handleInteractions'] as any).mock.calls[0][0];

                // Similar to expect(InteractionStrategy['handleInteractions']).toHaveBeenCalledWith
                // except without nonymous functions, which Jest doesn't evaluate correctly.
                if (interactionCallbackType === DiscordInteractionCallbackType.Update)
                {
                    expect(handleInteractionsCall.interactionResponse).toEqual(
                        interaction.message,
                    );
                }
                else
                {
                    expect(handleInteractionsCall.interactionResponse).toEqual(
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
        const userId = '1234';
        const otherUserId = '5678';

        let buttonInteraction: ButtonInteraction;
        let onRerollCallback: jest.Mock;

        beforeEach(() =>
        {
            onRerollCallback = jest.fn();
        });

        describe(`RerollButtonName: ${RerollButtonName.Reroll}`, () =>
        {
            beforeEach(() =>
            {
                buttonInteraction = getFakeButtonInteraction(RerollButtonName.Reroll);
            });

            it('should call onRerollCallback', async () =>
            {
                await RerollStrategy['onRerollButtonPress']({
                    buttonInteraction,
                    onRerollCallback,
                    previousResponse: undefined,
                });

                expect(onRerollCallback).toHaveBeenCalledTimes(1);
                expect(onRerollCallback).toHaveBeenCalledWith(
                    expect.any(Object),
                    { hasTakenDramaticFailure: false },
                );
            });

            it('should call buttonInteraction.update on success', async () =>
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

        describe(`RerollButtonName: ${RerollButtonName.TakeDramaticFailure}`, () =>
        {
            beforeEach(() =>
            {
                buttonInteraction = getFakeButtonInteraction(
                    RerollButtonName.TakeDramaticFailure,
                    undefined,
                    {
                        content: `<@${userId}> rolled 5 dice.`,
                    },
                    {
                        id: userId,
                    },
                );
            });

            it('should not call onRerollCallback', async () =>
            {
                await RerollStrategy['onRerollButtonPress']({
                    buttonInteraction,
                    onRerollCallback,
                    previousResponse: undefined,
                });

                expect(onRerollCallback).not.toHaveBeenCalled();
            });

            it('should call buttonInteraction.update and buttonInteraction.followUp on success', async () =>
            {
                const spyOnButtonInteractionFollowUp = jest.spyOn(buttonInteraction, 'followUp');
                const spyOnButtonInteractionUpdate = jest.spyOn(buttonInteraction, 'update');

                await RerollStrategy['onRerollButtonPress']({
                    buttonInteraction,
                    onRerollCallback,
                    previousResponse: undefined,
                });

                expect(spyOnButtonInteractionFollowUp).toHaveBeenCalledTimes(1);
                expect(spyOnButtonInteractionUpdate).toHaveBeenCalledTimes(1);
            });

            it('should reply with error message if user is not pinged in message', async () =>
            {
                buttonInteraction = getFakeButtonInteraction(
                    RerollButtonName.TakeDramaticFailure,
                    undefined,
                    {
                        content: `<@${userId}> rolled 5 dice.`,
                    },
                    {
                        id: userId,
                    },
                );
                buttonInteraction.user.id = otherUserId;

                const spyOnButtonInteractionReply = jest.spyOn(buttonInteraction, 'reply');
                const spyOnButtonInteractionUpdate = jest.spyOn(buttonInteraction, 'update');

                await RerollStrategy['onRerollButtonPress']({
                    buttonInteraction,
                    onRerollCallback,
                    previousResponse: undefined,
                });

                expect(spyOnButtonInteractionReply).toHaveBeenCalledTimes(1);
                expect(spyOnButtonInteractionUpdate).not.toHaveBeenCalled();
            });

            it('should reply with error message if user is pinged more than once in message', async () =>
            {
                buttonInteraction = getFakeButtonInteraction(
                    RerollButtonName.TakeDramaticFailure,
                    undefined,
                    {
                        content: `<@${userId}> rolled 5 dice. <@${userId}> did that!`,
                    },
                    {
                        id: userId,
                    },
                );

                const spyOnButtonInteractionReply = jest.spyOn(buttonInteraction, 'reply');
                const spyOnButtonInteractionUpdate = jest.spyOn(buttonInteraction, 'update');

                await RerollStrategy['onRerollButtonPress']({
                    buttonInteraction,
                    onRerollCallback,
                    previousResponse: undefined,
                });

                expect(spyOnButtonInteractionReply).toHaveBeenCalledTimes(1);
                expect(spyOnButtonInteractionUpdate).not.toHaveBeenCalled();
            });
        });
    });
});
