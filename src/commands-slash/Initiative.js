const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const options = require('./options');
const { mathParserOptions } = require('../constants/mathParserOptions');
const rollConstants = require('../constants/roll');
const DiceService = require('../services/DiceService');
const InitiativeResponseFormatterService = require('../services/InitiativeResponseFormatterService');
const { Parser } = require('expr-eval');

class Initiative extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addStringOption(options.initiative.initiativeModifier)
            .addStringOption(options.roll.name)
            .addBooleanOption(options.roll.secret);

        this._mathParser = new Parser(mathParserOptions);
    }

    async run(interaction)
    {
        // Get initial parameter result
        const initiativeModifierExpression = interaction.options.getString('initiative_modifier');
        const isSecret = interaction.options.getBoolean('secret') || false;
        const name = interaction.options.getString('name');

        // Send message to show the command was received
        await interaction.deferReply({
            ephemeral: isSecret,
            fetchReply: true,
        });

        // Get result
        let successfullyParsedDicepool = true;
        let initiativeModifier;

        try {
            initiativeModifier = this._mathParser.evaluate(initiativeModifierExpression);
        } catch (err) {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            successfullyParsedDicepool = false;
            await interaction.editReply(`An invalid initiative modifier was submitted. Include only numbers, plus signs (+), and subtraction signs (-).`);
        }

        if (successfullyParsedDicepool) {
            const dicePoolGroup = this.roll();

            // Response
            const initiativeResponseFormatterService = new InitiativeResponseFormatterService({
                authorId: interaction.user.id,
                dicePoolGroup,
                initiativeModifier,
                name,
            });
            await interaction.editReply(
                initiativeResponseFormatterService.getResponse()
            );
        }
    }

    get description()
    {
        return `Roll one d10 with no rerolls to determine initiative order.`;
    }

    roll()
    {
        // Get parameter results
        const numberOfDice = 1;
        const rerollsKey = rollConstants.rerollsEnum.no_again.key;

        // Convert parameters to necessary inputs for service calls
        const rerollOnGreaterThanOrEqualTo = rollConstants.rerollsEnum[rerollsKey]?.number;

        // Roll the dice
        const diceService = new DiceService({
            count: numberOfDice,
            rerollOnGreaterThanOrEqualTo,
            successOnGreaterThanOrEqualTo: 10, // You can't succeed at initiative rolls, so just set the number really high
            canBeDramaticFailure: false,
        });
        const dicePoolGroup = diceService.roll();

        return dicePoolGroup;
    }

    rollWithModifier(modifier = 0)
    {
        const dicePoolGroup = this.roll();
        const [result] = dicePoolGroup.getBiggestResult().rollResults;
        return result + modifier;
    }
}



module.exports = new Initiative();
