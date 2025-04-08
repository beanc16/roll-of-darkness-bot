import { logger } from '@beanc16/logger';
import type {
    ActionRowBuilder,
    ButtonBuilder,
    Message,
} from 'discord.js';

import {
    ButtonListenerRestartStyle,
    ButtonStrategy,
    GetMessageDataOptions,
    GetMessageDataResponse,
} from '../../../src/commands-slash/strategies/ButtonStrategy.js';
import type { CommandName } from '../../../src/types/discord.js';
import { getFakeButtonActionRowBuilder } from '../../fakes/discord/builders.js';
import { getFakeMessage } from '../../fakes/discord/components.js';
import { getFakeButtonInteraction } from '../../fakes/discord/interactions.js';

describe('class: ButtonStrategy', () =>
{
    describe('method: handleButtonInteractions', () =>
    {
        let commandName: CommandName;
        let interactionResponse: Message<boolean>;
        let actionRowBuilder: ActionRowBuilder<ButtonBuilder>;
        let onButtonPress: jest.Mock;
        let getButtonRowComponent: jest.Mock<ActionRowBuilder<ButtonBuilder>>;

        beforeEach(() =>
        {
            jest.clearAllMocks();

            commandName = '/fake_command';
            interactionResponse = getFakeMessage('fake-content');
            actionRowBuilder = getFakeButtonActionRowBuilder({
                customId: 'fake-button',
            });
            onButtonPress = jest.fn();
            getButtonRowComponent = jest.fn(() => actionRowBuilder);
        });

        describe('does receive button interactions', () =>
        {
            beforeEach(() =>
            {
                jest.spyOn(interactionResponse, 'awaitMessageComponent').mockResolvedValue(
                    getFakeButtonInteraction('fake-button'),
                );
            });

            describe.each([
                [ButtonListenerRestartStyle.OnSuccess, true],
                [ButtonListenerRestartStyle.Never, false],
            ])('restartStyle: %s', (restartStyle, shouldListenRecursively) =>
            {
                it('should call the onButtonPress parameter', async () =>
                {
                    await ButtonStrategy.handleButtonInteractions({
                        interactionResponse,
                        commandName,
                        restartStyle,
                        onButtonPress,
                        getButtonRowComponent,
                        maxRecursionDepth: 1,
                    });

                    expect(onButtonPress).toHaveBeenCalled();
                });

                /* eslint-disable jest/no-conditional-expect */ // Ignore for this one test that tests all possible outcomes
                it(`method should ${shouldListenRecursively ? '' : 'not '}recursively call itself`, async () =>
                {
                    const spyOnHandleButtonInteractions = jest.spyOn(ButtonStrategy, 'handleButtonInteractions');

                    await ButtonStrategy.handleButtonInteractions({
                        interactionResponse,
                        commandName,
                        restartStyle,
                        onButtonPress,
                        getButtonRowComponent,
                        maxRecursionDepth: 1,
                    });

                    if (shouldListenRecursively)
                    {
                        // Called once in this test, then again in the function itself
                        expect(spyOnHandleButtonInteractions).toHaveBeenCalledTimes(2);
                    }
                    else
                    {
                        // Called once in this test, but not afterwards
                        expect(spyOnHandleButtonInteractions).toHaveBeenCalledTimes(1);
                    }
                });
                /* eslint-enable jest/no-conditional-expect */
            });
        });

        describe('does not receive button interactions', () =>
        {
            describe.each([
                [ButtonListenerRestartStyle.OnSuccess],
                [ButtonListenerRestartStyle.Never],
            ])('restartStyle: %s', (restartStyle) =>
            {
                beforeEach(() =>
                {
                    jest.spyOn(interactionResponse, 'awaitMessageComponent').mockRejectedValue(
                        new Error('Collector received no interactions before ending with reason: fake-reason'),
                    );
                });

                it('should not call the onButtonPress parameter', async () =>
                {
                    await ButtonStrategy.handleButtonInteractions({
                        interactionResponse,
                        commandName,
                        restartStyle,
                        onButtonPress,
                        getButtonRowComponent,
                        maxRecursionDepth: 1,
                    });

                    expect(onButtonPress).not.toHaveBeenCalled();
                });

                it(`method should not recursively call itself`, async () =>
                {
                    const spyOnHandleButtonInteractions = jest.spyOn(ButtonStrategy, 'handleButtonInteractions');

                    await ButtonStrategy.handleButtonInteractions({
                        interactionResponse,
                        commandName,
                        restartStyle,
                        onButtonPress,
                        getButtonRowComponent,
                        maxRecursionDepth: 1,
                    });

                    // Called once in this test, but not afterwards
                    expect(spyOnHandleButtonInteractions).toHaveBeenCalledTimes(1);
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

                        await ButtonStrategy.handleButtonInteractions({
                            interactionResponse,
                            commandName,
                            restartStyle,
                            onButtonPress,
                            getButtonRowComponent,
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

                        await ButtonStrategy.handleButtonInteractions({
                            interactionResponse,
                            commandName,
                            restartStyle,
                            onButtonPress,
                            getButtonRowComponent,
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
        const components = [
            getFakeButtonActionRowBuilder({
                customId: 'fake-button',
            }),
        ];
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
        ] as [string, GetMessageDataOptions][])('should return the message data if given %s', (_, options) =>
        {
            const result = ButtonStrategy.getMessageData(
                options,
                () => components[0],
            );

            expect(result).toEqual(expectedResult);
        });

        it('should call the given callback', () =>
        {
            const callback = jest.fn((): ActionRowBuilder<ButtonBuilder> => components[0]);
            ButtonStrategy.getMessageData(
                content,
                callback,
            );

            expect(callback).toHaveBeenCalled();
        });
    });
});
