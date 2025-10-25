import { FakeChatInputCommandInteraction } from '../../../../../fakes/discord/interactions.js';
import { AddMathParser } from '../../../../../services/MathParser/AddMathParser.js';
import { CalculateBattleExpStrategy } from '../CalculateBattleExpStrategy.js';

const mockedJestAddMathParser = jest.mock('../../../../../services/MathParser/AddMathParser.js');

describe('class: CalculateBattleExpStrategy', () =>
{
    const input = new FakeChatInputCommandInteraction();

    beforeEach(() =>
    {
        // total_levels_of_enemies
        jest.spyOn(input.options, 'getString').mockReturnValue('1 + 1 + 1');

        // significance_multiplier
        jest.spyOn(input.options, 'getNumber').mockReturnValue(4);

        // num_of_players
        jest.spyOn(input.options, 'getInteger').mockReturnValue(2);

        jest.clearAllMocks();
    });

    describe('method: run', () =>
    {
        it('should display total experience if the dicepool is valid', async () =>
        {
            mockedJestAddMathParser.spyOn(AddMathParser.prototype, 'evaluate').mockReturnValue(
                3,
            );

            const result = await CalculateBattleExpStrategy.run(input);

            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(input.editReply).toHaveBeenCalledWith(
                `Each player gets 6 exp to split between the Pokémon that they used.`,
            );
            expect(result).toEqual(true);
        });

        it('should display error message if the dicepool is invalid', async () =>
        {
            mockedJestAddMathParser.spyOn(AddMathParser.prototype, 'evaluate').mockReturnValue(
                undefined,
            );

            const result = await CalculateBattleExpStrategy.run(input);

            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(input.editReply).toHaveBeenCalledWith(
                'An invalid dicepool was submitted. Include only numbers and plus signs (+).',
            );
            expect(result).toEqual(true);
        });
    });
});
