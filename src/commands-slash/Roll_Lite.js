const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const { Text } = require('@beanc16/discordjs-helpers');
const options = require('./options');
const { mathParserOptions } = require('../constants/mathParserOptions');
const DiceLiteService = require('../services/DiceLiteService');
const { diceParserTypes, DiceStringParser } = require('../services/DiceStringParser');
const { Parser } = require('expr-eval');

class Roll_Lite extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addStringOption(options.rollLite.dicePool)
            .addBooleanOption(options.roll.secret);

        this._mathParser = new Parser(mathParserOptions);
    }

    async run(interaction)
    {
        // Get parameter results
        const dicePoolExpression = interaction.options.getString('dice_pool');
        const isSecret = interaction.options.getBoolean('secret') || false;

        // Send message to show the command was received
        await interaction.deferReply({
            ephemeral: isSecret,
            fetchReply: true,
        });

        // Get result
        let successfullyParsedDicepool = true;
        let parsedDicePool, finalRollResult;

        try {
            parsedDicePool = DiceStringParser.parse(dicePoolExpression);
        } catch (err) {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            successfullyParsedDicepool = false;
            await interaction.editReply(`An invalid dicepool was submitted. Include only valid dice, plus signs (+), and subtraction signs (-).`);
        }

        // Roll each dice and parse results to string for math parser.
        const {
            unparsedMathString,
            resultString,
        } = parsedDicePool.reduce((acc, cur) =>
        {
            if (cur.type === diceParserTypes.Die)
            {
                const { numberOfDice, sides } = cur;
                const dieString = `${numberOfDice}d${sides}`;
                const rollResult = new DiceLiteService({
                    count: numberOfDice,
                    sides,
                }).roll();
                const rollTotal = rollResult.reduce((acc, cur) => (acc + cur), 0);
                const rollResultsAsString = rollResult.join(', ');

                acc.processedDicePool.push({
                    ...cur,
                    die: dieString,
                    result: rollResult,
                    total: rollTotal,
                });
                acc.unparsedMathString += rollTotal;
                acc.resultString += ` ${dieString} (${rollResultsAsString})`;
            }

            else if (cur.type === diceParserTypes.MathOperator)
            {
                acc.processedDicePool.push(cur);
                acc.unparsedMathString += cur.operator;
                acc.resultString += ` ${cur.operator}`;
            }

            else if (cur.type === diceParserTypes.Modifier)
            {
                acc.processedDicePool.push(cur);
                acc.unparsedMathString += cur.modifier;
                acc.resultString += ` ${cur.modifier}`;
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
            successfullyParsedDicepool = false;
            await interaction.editReply(`An invalid dicepool was submitted. Include only numbers, plus signs (+), and subtraction signs (-).`);
        }

        // Run this separately from the try catch, so errors in super.run don't send an incorrect error message
        if (successfullyParsedDicepool) {
            await interaction.editReply(
                `${Text.Ping.user(interaction.user.id)} :game_die:\n`
                + `${Text.bold('Result')}:${resultString}\n`
                + `${Text.bold('Total')}: ${finalRollResult}`
            );
        }
    }

    get description()
    {
        return `Roll a dice pool with any number of any sided dice.`;
    }
}



module.exports = new Roll_Lite();
