import { BaseStrategyExecutor } from '../../../src/commands-slash/strategies/BaseStrategyExecutor.js';
import { StrategyMap } from '../../../src/commands-slash/strategies/types/ChatIteractionStrategy.js';
import { FakeChatInteractionStrategy } from '../../fakes/strategies.js';

describe('class: BaseStrategyExecutor', () =>
{
    describe('method: getStrategy', () =>
    {
        describe('if subcommandGroup is provided', () =>
        {
            it('should return undefined if no strategy is found', () =>
            {
                const strategies: StrategyMap<string, string> = {};
                const subcommandGroup: string = 'group';
                const subcommand: string = 'subcommand';

                const result = BaseStrategyExecutor['getStrategy']({
                    strategies,
                    subcommandGroup,
                    subcommand,
                });

                expect(result).toBeUndefined();
            });

            it('should return the correct strategy if the strategy exists', () =>
            {
                const subcommandGroup: string = 'group';
                const subcommand: string = 'subcommand';
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Necessary to properly test static strategies
                // @ts-ignore
                const strategies: StrategyMap<string, string> = {
                    [subcommandGroup]: {
                        [subcommand]: FakeChatInteractionStrategy,
                    },
                };

                const result = BaseStrategyExecutor['getStrategy']({
                    strategies,
                    subcommandGroup,
                    subcommand,
                });

                expect(result).toEqual(FakeChatInteractionStrategy);
            });
        });

        describe('if subcommandGroup is not provided', () =>
        {
            it('should return undefined if no strategy is found', () =>
            {
                const strategies: StrategyMap<string, string> = {};
                const subcommand: string = 'subcommand';

                const result = BaseStrategyExecutor['getStrategy']({
                    strategies,
                    subcommand,
                });

                expect(result).toBeUndefined();
            });

            it('should return the correct strategy if the strategy exists', () =>
            {
                const subcommand: string = 'subcommand';
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Necessary to properly test static strategies
                // @ts-ignore
                const strategies: StrategyMap<string, string> = {
                    [subcommand]: FakeChatInteractionStrategy,
                };

                const result = BaseStrategyExecutor['getStrategy']({
                    strategies,
                    subcommand,
                });

                expect(result).toEqual(FakeChatInteractionStrategy);
            });
        });
    });
});
