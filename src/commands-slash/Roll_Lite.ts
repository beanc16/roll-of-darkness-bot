import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';
import { Parser } from 'expr-eval';

import * as options from './options/index.js';
import { addAndSubtractMathParserOptions } from '../constants/mathParserOptions.js';
import { DiceLiteService } from '../services/DiceLiteService.js';
import { diceParserTypes, DiceStringParser, MathOperator, ParsedDicePool, ParsedDie, ParsedModifier, ProcessedDicePool } from '../services/DiceStringParser.js';

class Roll_Lite extends BaseSlashCommand
{
    private _mathParser: Parser;

    constructor()
    {
        super();
        this._slashCommandData
            .addStringOption(options.rollLite.dicePool)
            .addStringOption(options.roll.name)
            .addBooleanOption(options.roll.secret);

        this._mathParser = new Parser(addAndSubtractMathParserOptions);
    }

    async run(interaction: ChatInputCommandInteraction)
    {
        // Get parameter results
        const dicePoolExpression = interaction.options.getString('dice_pool', true);
        const isSecret = interaction.options.getBoolean('secret') || false;
        const name = interaction.options.getString('name');

        // Send message to show the command was received
        await interaction.deferReply({
            ephemeral: isSecret,
            fetchReply: true,
        });

        // Get result
        let parsedDicePool: ParsedDicePool, finalRollResult: number;

        try {
            parsedDicePool = DiceStringParser.parse(dicePoolExpression);
        } catch (err) {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            await interaction.editReply(`An invalid dicepool was submitted. Include only valid dice, plus signs (+), and subtraction signs (-).`);
            return;
        }

        // Roll each dice and parse results to string for math parser.
        const {
            unparsedMathString,
            resultString,
        } = parsedDicePool.reduce<{
            processedDicePool: ProcessedDicePool;
            unparsedMathString: string;
            resultString: string;
        }>((acc, cur) =>
        {
            if (cur.type === diceParserTypes.Die)
            {
                const curParsedDie = cur as ParsedDie;
                const { numberOfDice, sides } = curParsedDie;
                const dieString = `${numberOfDice}d${sides}`;
                const rollResult = new DiceLiteService({
                    count: numberOfDice,
                    sides,
                }).roll();
                const rollTotal = rollResult.reduce((acc, cur) => (acc + cur), 0);
                const rollResultsAsString = rollResult.join(', ');

                acc.processedDicePool.push({
                    ...curParsedDie,
                    die: dieString,
                    result: rollResult,
                    total: rollTotal,
                });
                acc.unparsedMathString += rollTotal;
                acc.resultString += ` ${dieString} (${rollResultsAsString})`;
            }

            else if (cur.type === diceParserTypes.MathOperator)
            {
                const curMathOperator = cur as MathOperator;
                acc.processedDicePool.push(curMathOperator);
                acc.unparsedMathString += curMathOperator.operator;
                acc.resultString += ` ${curMathOperator.operator}`;
            }

            else if (cur.type === diceParserTypes.Modifier)
            {
                const curParsedModifier = cur as ParsedModifier;
                acc.processedDicePool.push(curParsedModifier);
                acc.unparsedMathString += curParsedModifier.modifier;
                acc.resultString += ` ${curParsedModifier.modifier}`;
            }

            return acc;
        }, {
            processedDicePool: [],
            unparsedMathString: '',
            resultString: '',
        });

        // Parse math string for results.
        try {
            finalRollResult = this._mathParser.evaluate(unparsedMathString);
        } catch (err) {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            await interaction.editReply(`An invalid dicepool was submitted. Include only numbers, plus signs (+), and subtraction signs (-).`);
            return;
        }

        // Run this separately from the try catch, so errors in super.run don't send an incorrect error message
        await interaction.editReply( // TODO: Add name here like /roll supports.
            `${Text.Ping.user(interaction.user.id)} :game_die:\n`
            + `${Text.bold(name ?? 'Result')}:${resultString}\n`
            + `${Text.bold('Total')}: ${finalRollResult}`
        );
    }

    get description()
    {
        return `Roll a dice pool with any number of any sided dice.`;
    }
}



export default new Roll_Lite();
