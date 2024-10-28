import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { ChatInputCommandInteraction } from 'discord.js';
import { Parser } from 'expr-eval';

import * as initiativeOptions from './Nwod/options/initiative.js';
import * as rollOptions from './Nwod/options/roll.js';
import { addAndSubtractMathParserOptions } from '../constants/mathParserOptions.js';
import rollConstants from '../constants/roll.js';
import { DiceService } from '../services/DiceService.js';
import { InitiativeResponseFormatterService } from '../services/InitiativeResponseFormatterService.js';

// TODO: Delete this later now that /nwod initiative exists
class Initiative extends BaseSlashCommand
{
    private _mathParser: Parser;

    constructor()
    {
        super();
        this._slashCommandData
            .addStringOption(initiativeOptions.initiativeModifier)
            .addStringOption(rollOptions.name)
            .addBooleanOption(rollOptions.secret);

        this._mathParser = new Parser(addAndSubtractMathParserOptions);
    }

    async run(interaction: ChatInputCommandInteraction)
    {
        // Get initial parameter result
        const initiativeModifierExpression = interaction.options.getString('initiative_modifier', true);
        const isSecret = interaction.options.getBoolean('secret') || false;
        const name = interaction.options.getString('name');

        // Send message to show the command was received
        await interaction.deferReply({
            ephemeral: isSecret,
            fetchReply: true,
        });

        // Get result
        let initiativeModifier: number = 0;

        try {
            initiativeModifier = this._mathParser.evaluate(initiativeModifierExpression);
        } catch (err) {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            await interaction.editReply(`An invalid initiative modifier was submitted. Include only numbers, plus signs (+), and subtraction signs (-).`);
            return;
        }

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

    get description()
    {
        return `Roll one d10 with no rerolls to determine initiative order.`;
    }

    roll()
    {
        // Get parameter results
        const numberOfDice = 1;
        const rerollsKey = rollConstants.rerollsEnum.no_again.key as keyof typeof rollConstants.rerollsEnum;

        // Convert parameters to necessary inputs for service calls
        const rerollOnGreaterThanOrEqualTo = rollConstants.rerollsEnum[rerollsKey].number;

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



export default new Initiative();
