import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';
import { Parser } from 'expr-eval';

import { rollLite } from './options/index.js';
import * as rollOptions from './Nwod/options/roll.js';
import { addAndSubtractMathParserOptions } from '../constants/mathParserOptions.js';
import { DiceStringParser } from '../services/DiceStringParser.js';
import { OnRerollCallbackOptions, RerollStrategy } from './strategies/RerollStrategy.js';
import { DiscordInteractionCallbackType } from '../types/discord.js';

class Roll_Lite extends BaseSlashCommand
{
    private mathParser: Parser;

    constructor()
    {
        super();
        this._slashCommandData
            .addStringOption(rollLite.dicePool)
            .addStringOption(rollOptions.name)
            .addBooleanOption(rollOptions.secret);

        this.mathParser = new Parser(addAndSubtractMathParserOptions);
    }

    public async run(
        interaction: ChatInputCommandInteraction,
        {
            interactionCallbackType = DiscordInteractionCallbackType.EditReply,
            newCallingUserId,
        }: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    )
    {
        // Get parameter results
        const dicePoolExpression = interaction.options.getString('dice_pool', true);
        const isSecret = interaction.options.getBoolean('secret') || false;
        const name = interaction.options.getString('name');

        // Send message to show the command was received
        if (interactionCallbackType === DiscordInteractionCallbackType.EditReply)
        {
            await interaction.deferReply({
                ephemeral: isSecret,
                fetchReply: true,
            });
        }

        // Get result
        let unparsedMathString: string, resultString: string, finalRollResult: number;

        try {
            // Roll each dice and parse results to string for math parser.
            const rollResult = DiceStringParser.parseAndRoll(dicePoolExpression);
            unparsedMathString = rollResult.unparsedMathString;
            resultString = rollResult.resultString;
        } catch (err) {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            await interaction.editReply(`An invalid dicepool was submitted. Include only valid dice, plus signs (+), and subtraction signs (-).`);
            return;
        }

        // Parse math string for results.
        try {
            finalRollResult = this.mathParser.evaluate(unparsedMathString);
        } catch (err) {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            await interaction.editReply(`An invalid dicepool was submitted. Include only numbers, plus signs (+), and subtraction signs (-).`);
            return;
        }

        // Run the below separately from the try catch, so errors in super.run don't send an incorrect error message
        const responseMessage = `${Text.Ping.user(newCallingUserId ?? interaction.user.id)} :game_die:\n`
            + `${Text.bold(name ?? 'Result')}:${resultString}\n`
            + `${Text.bold('Total')}: ${finalRollResult}`;

        // Send response with reroll button
        await RerollStrategy.run({
            interaction,
            options: responseMessage,
            interactionCallbackType,
            onRerollCallback: (rerollCallbackOptions) => this.run(
                interaction, 
                rerollCallbackOptions
            ),
            commandName: this.commandName,
        });
    }

    get description()
    {
        return `Roll a dice pool with any number of any sided dice.`;
    }
}



export default new Roll_Lite();
