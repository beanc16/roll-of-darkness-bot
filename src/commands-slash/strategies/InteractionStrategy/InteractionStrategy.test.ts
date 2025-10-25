import { logger } from '@beanc16/logger';
import type {
    ActionRowBuilder,
    ButtonBuilder,
    Message,
    StringSelectMenuBuilder,
} from 'discord.js';

import { getFakeButtonActionRowBuilder, getFakeStringSelectMenuActionRowBuilder } from '../../../fakes/discord/builders.js';
import { getFakeMessage } from '../../../fakes/discord/components.js';
import { FakeStringSelectMenuInteraction, getFakeButtonInteraction } from '../../../fakes/discord/interactions.js';
import type { CommandName } from '../../../types/discord.js';
import {
    GetMessageDataOptions,
    GetMessageDataResponse,
    InteractionListenerRestartStyle,
    InteractionStrategy,
} from './InteractionStrategy.js';

describe.each([
    ['buttons', {
        interaction: getFakeButtonInteraction('fake-button'),
        actionRowBuilder: getFakeButtonActionRowBuilder({
            customId: 'fake-button',
        }),
    }],
    ['string select menus', {
        interaction: new FakeStringSelectMenuInteraction(),
        actionRowBuilder: getFakeStringSelectMenuActionRowBuilder({
            customId: 'fake-string-select-menu',
        }),
    }],
])('class: InteractionStrategy - %s', (_1, { interaction, actionRowBuilder }) =>
{
    describe('method: handleInteractions', () =>
    {
        let commandName: CommandName;
        let interactionResponse: Message<boolean>;
        let onInteraction: jest.Mock;
        let getActionRowComponent: jest.Mock<ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<StringSelectMenuBuilder>>;

        beforeEach(() =>
        {
            jest.clearAllMocks();

            commandName = '/fake_command';
            interactionResponse = getFakeMessage('fake-content');
            onInteraction = jest.fn();
            getActionRowComponent = jest.fn(() => actionRowBuilder);
        });

        describe('does receive interactions', () =>
        {
            beforeEach(() =>
            {
                jest.spyOn(interactionResponse, 'awaitMessageComponent').mockResolvedValue(
                    interaction,
                );
            });

            describe.each([
                [InteractionListenerRestartStyle.OnSuccess, true],
                [InteractionListenerRestartStyle.Never, false],
            ])('restartStyle: %s', (restartStyle, shouldListenRecursively) =>
            {
                it('should call the onInteraction parameter', async () =>
                {
                    await InteractionStrategy.handleInteractions({
                        interactionResponse,
                        commandName,
                        restartStyle,
                        onInteraction,
                        getActionRowComponent,
                        maxRecursionDepth: 1,
                    });

                    expect(onInteraction).toHaveBeenCalled();
                });

                /* eslint-disable jest/no-conditional-expect */ // Ignore for this one test that tests all possible outcomes
                it(`method should ${shouldListenRecursively ? '' : 'not '}recursively call itself`, async () =>
                {
                    const spyOnHandleInteractions = jest.spyOn(InteractionStrategy, 'handleInteractions');

                    await InteractionStrategy.handleInteractions({
                        interactionResponse,
                        commandName,
                        restartStyle,
                        onInteraction,
                        getActionRowComponent,
                        maxRecursionDepth: 1,
                    });

                    if (shouldListenRecursively)
                    {
                        // Called once in this test, then again in the function itself
                        expect(spyOnHandleInteractions).toHaveBeenCalledTimes(2);
                    }
                    else
                    {
                        // Called once in this test, but not afterwards
                        expect(spyOnHandleInteractions).toHaveBeenCalledTimes(1);
                    }
                });
                /* eslint-enable jest/no-conditional-expect */
            });
        });

        describe('does not receive interactions', () =>
        {
            describe.each([
                [InteractionListenerRestartStyle.OnSuccess],
                [InteractionListenerRestartStyle.Never],
            ])('restartStyle: %s', (restartStyle) =>
            {
                beforeEach(() =>
                {
                    jest.spyOn(interactionResponse, 'awaitMessageComponent').mockRejectedValue(
                        new Error('Collector received no interactions before ending with reason: fake-reason'),
                    );
                });

                it('should not call the onInteraction parameter', async () =>
                {
                    await InteractionStrategy.handleInteractions({
                        interactionResponse,
                        commandName,
                        restartStyle,
                        onInteraction,
                        getActionRowComponent,
                        maxRecursionDepth: 1,
                    });

                    expect(onInteraction).not.toHaveBeenCalled();
                });

                it(`method should not recursively call itself`, async () =>
                {
                    const spyOnHandleInteractions = jest.spyOn(InteractionStrategy, 'handleInteractions');

                    await InteractionStrategy.handleInteractions({
                        interactionResponse,
                        commandName,
                        restartStyle,
                        onInteraction,
                        getActionRowComponent,
                        maxRecursionDepth: 1,
                    });

                    // Called once in this test, but not afterwards
                    expect(spyOnHandleInteractions).toHaveBeenCalledTimes(1);
                });

                describe.each([
                    ['fake-reason', {
                        shouldLog: true,
                        shouldDisableComponents: true,
                    }],
                    ['time', {
                        shouldLog: false,
                        shouldDisableComponents: true,
                    }],
                    ['messageDelete', {
                        shouldLog: false,
                        shouldDisableComponents: false,
                    }],
                ])('errorType: %s', (errorReason, { shouldLog, shouldDisableComponents }) =>
                {
                    beforeEach(() =>
                    {
                        jest.spyOn(interactionResponse, 'awaitMessageComponent').mockRejectedValue(
                            new Error(`Collector received no interactions before ending with reason: ${errorReason}`),
                        );
                    });

                    /* eslint-disable jest/no-conditional-expect */ // Ignore for this one test that tests all possible outcomes
                    it(`method should ${shouldLog ? '' : 'not '}log the error`, async () =>
                    {
                        const spyOnLoggerError = jest.spyOn(logger, 'error');

                        await InteractionStrategy.handleInteractions({
                            interactionResponse,
                            commandName,
                            restartStyle,
                            onInteraction,
                            getActionRowComponent,
                            maxRecursionDepth: 1,
                        });

                        if (shouldLog)
                        {
                            expect(spyOnLoggerError).toHaveBeenCalledTimes(1);
                        }
                        else
                        {
                            expect(spyOnLoggerError).not.toHaveBeenCalled();
                        }
                    });
                    /* eslint-enable jest/no-conditional-expect */

                    /* eslint-disable jest/no-conditional-expect */ // Ignore for this one test that tests all possible outcomes
                    it(`method should ${shouldDisableComponents ? '' : 'not '}disable components`, async () =>
                    {
                        const spyOnComponentsSetDisabled = actionRowBuilder.components.map(component =>
                            jest.spyOn(component, 'setDisabled'),
                        );

                        await InteractionStrategy.handleInteractions({
                            interactionResponse,
                            commandName,
                            restartStyle,
                            onInteraction,
                            getActionRowComponent,
                            maxRecursionDepth: 1,
                        });

                        // All components were disabled
                        spyOnComponentsSetDisabled.forEach((spyOnComponentSetDisabled) =>
                        {
                            if (shouldDisableComponents)
                            {
                                expect(spyOnComponentSetDisabled).toHaveBeenCalledWith(true);
                            }
                            else
                            {
                                expect(spyOnComponentSetDisabled).not.toHaveBeenCalled();
                            }
                        });
                    });
                    /* eslint-enable jest/no-conditional-expect */
                });
            });
        });
    });

    describe('method: getMessageData', () =>
    {
        const content = 'Some Message';
        const components = [actionRowBuilder];
        let expectedResult: GetMessageDataResponse;

        beforeEach(() =>
        {
            expectedResult = {
                content,
                components,
            };
        });

        it.each([
            ['a string', content],
            ['an object with a string', { content }],
        ] as [string, GetMessageDataOptions][])('should return the message data if given %s', (_2, options) =>
        {
            const result = InteractionStrategy.getMessageData(
                options,
                () => components[0],
            );

            expect(result).toEqual(expectedResult);
        });

        it('should call the given callback', () =>
        {
            const callback = jest.fn((): ActionRowBuilder<ButtonBuilder> | ActionRowBuilder<StringSelectMenuBuilder> => components[0]);
            InteractionStrategy.getMessageData(
                content,
                callback,
            );

            expect(callback).toHaveBeenCalled();
        });
    });
});
