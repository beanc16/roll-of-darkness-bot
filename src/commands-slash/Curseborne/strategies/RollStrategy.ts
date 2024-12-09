import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { DiscordInteractionCallbackType } from '../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../strategies/RerollStrategy.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { CurseborneSubcommand } from '../options/index.js';
import { TwoSuccessesOption } from '../options/roll.js';
import { CurseborneDiceService } from '../services/CurseborneDiceService.js';

@staticImplements<ChatIteractionStrategy>()
export class RollStrategy
{
    public static key: CurseborneSubcommand.Roll = CurseborneSubcommand.Roll;

    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
            newCallingUserId: interaction.user.id,
        },
    ): Promise<boolean>
    {
        // Get parameter results
        const numberOfDice = interaction.options.getInteger('number_of_dice', true);
        const name = interaction.options.getString('name');
        const numberOfCursedDice = interaction.options.getInteger('cursed_dice') ?? 0;
        const enhancements = interaction.options.getInteger('enhancements') ?? 0;
        const successesKey = interaction.options.getString('double_successes') as TwoSuccessesOption ?? TwoSuccessesOption.DoubleTens;

        // Convert parameters to necessary inputs for service calls
        const twoSuccessesOn = this.getTwoSuccessesOn(successesKey);

        // Roll the dice
        const diceService = new CurseborneDiceService({
            count: Math.max(0, numberOfDice - numberOfCursedDice),
            twoSuccessesOn,
            enhancements,
        });
        const { numOfSuccesses, rollResults } = diceService.roll();

        // Roll cursed dice
        const cursedDiceService = new CurseborneDiceService({
            count: (numberOfDice - numberOfCursedDice > 0)
                ? numberOfCursedDice
                : numberOfDice,
        });
        const { numOfSuccesses: numOfCursedDiceSuccesses, rollResults: cursedDiceRollResults } = cursedDiceService.roll();

        // Send message
        const response = this.getResponse({
            interaction,
            numberOfDice,
            successesKey,
            enhancements,
            name,
            numOfSuccesses,
            rollResults,
            numberOfCursedDice,
            numOfCursedDiceSuccesses,
            cursedDiceRollResults,
            rerollCallbackOptions,
        });
        await RerollStrategy.run({
            interaction,
            options: response,
            interactionCallbackType: rerollCallbackOptions.interactionCallbackType,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: 'cb roll',
        });

        return true;
    }

    private static getTwoSuccessesOn(twoSuccessesOn: TwoSuccessesOption): number
    {
        if (twoSuccessesOn === TwoSuccessesOption.DoubleTens)
        {
            return 10;
        }

        if (twoSuccessesOn === TwoSuccessesOption.DoubleNines)
        {
            return 9;
        }

        if (twoSuccessesOn === TwoSuccessesOption.NoDoubles)
        {
            return 100;
        }

        return 10;
    }

    private static getResponse({
        interaction,
        numberOfDice,
        successesKey,
        enhancements,
        name,
        numOfSuccesses,
        rollResults,
        numberOfCursedDice,
        numOfCursedDiceSuccesses,
        cursedDiceRollResults,
        rerollCallbackOptions,
    }: {
        interaction: ChatInputCommandInteraction;
        numberOfDice: number;
        enhancements: number;
        successesKey: TwoSuccessesOption;
        name: string | null;
        numOfSuccesses: number;
        rollResults: number[];
        numberOfCursedDice: number;
        numOfCursedDiceSuccesses: number;
        cursedDiceRollResults: number[];
        rerollCallbackOptions: OnRerollCallbackOptions;
    }): string
    {
        const twoSuccessesOptionToAgainString: Record<TwoSuccessesOption, string> = {
            [TwoSuccessesOption.DoubleNines]: 'double 9s',
            [TwoSuccessesOption.NoDoubles]: 'no double 10s',
            [TwoSuccessesOption.DoubleTens]: '',
        };
        const againString = twoSuccessesOptionToAgainString[successesKey];

        const enhancementsString = (enhancements > 0)
            ? `${enhancements} enhancements`
            : '';

        const cursedDiceString = (numberOfCursedDice > 0)
            ? `${numberOfCursedDice} cursed dice`
            : '';

        const rollName = (name) ? ` for ${name}` : '';

        const rollStrings: string[] = [];

        if (rollResults.length > 0)
        {
            rollStrings.push(
                this.getRollString({
                    numOfSuccesses,
                    rollResults,
                }),
            );
        }

        if (cursedDiceRollResults.length > 0)
        {
            rollStrings.push(
                `${Text.italic('Cursed Dice:')}\n`
                + this.getRollString({
                    numOfSuccesses: numOfCursedDiceSuccesses,
                    rollResults: cursedDiceRollResults,
                }),
            );
        }

        return `${Text.Ping.user(rerollCallbackOptions.newCallingUserId ?? interaction.user.id)} rolled ${numberOfDice} dice${
            this.getCombinedExtrasString(againString, enhancementsString, cursedDiceString)
        }${rollName}.\n\n${rollStrings.join('\n\n')}`;
    }

    private static getCombinedExtrasString(...input: string[]): string
    {
        const inputWithNoEmptyStrings = input.filter(
            str => str.trim().length > 0,
        );
        let output = ' with ';

        if (inputWithNoEmptyStrings.length > 2)
        {
            output += inputWithNoEmptyStrings.join(', ');
            const indexOfLastComma = output.lastIndexOf(', ');

            return output.slice(0, indexOfLastComma + 1) + ' and' + output.slice(indexOfLastComma + 1);
        }

        if (inputWithNoEmptyStrings.length > 0)
        {
            return output + inputWithNoEmptyStrings.join(' and ');
        }

        return '';
    }

    private static getRollString({ numOfSuccesses, rollResults }: {
        numOfSuccesses: number;
        rollResults: number[];
    }): string
    {
        const successesAsSingularOrPlural = (numOfSuccesses !== 1)
            ? 'hits'
            : 'hit';

        return Text.bold(`${numOfSuccesses} ${successesAsSingularOrPlural}`)
            + (rollResults.length > 0 ? '\n' : '')
            + rollResults.join(', ');
    }
}
