import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { DiceStringParser } from '../services/Dice/DiceStringParser.js';
import { AddAndSubtractMathParser } from '../services/MathParser/AddAndSubtractMathParser.js';
import { DiscordInteractionCallbackType } from '../types/discord.js';
import * as rollOptions from './Nwod/options/roll.js';
import { rollLite } from './options/index.js';
import { OnRerollCallbackOptions, RerollStrategy } from './strategies/RerollStrategy/RerollStrategy.js';

class Roll extends BaseSlashCommand
{
    private mathParser: AddAndSubtractMathParser;

    constructor()
    {
        super();
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addStringOption(rollLite.dicePool)
            .addStringOption(rollOptions.name)
            .addBooleanOption(rollOptions.secret);

        this.mathParser = new AddAndSubtractMathParser();
    }

    public async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<void>
    {
        // Get parameter results
        const dicePoolExpression = interaction.options.getString('dice_pool', true);
        const isSecret = interaction.options.getBoolean('secret') || false;
        const name = interaction.options.getString('name');

        // Send message to show the command was received
        if (rerollCallbackOptions.interactionCallbackType === DiscordInteractionCallbackType.EditReply)
        {
            await interaction.deferReply({
                ephemeral: isSecret,
                fetchReply: true,
            });
        }

        // Roll each dice and parse results to string for math parser.
        const rollResult = DiceStringParser.parseAndRoll(dicePoolExpression);

        if (rollResult === undefined)
        {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
            await interaction.editReply(`An invalid dicepool was submitted. Include only valid dice, plus signs (+), and subtraction signs (-).`);
            return;
        }

        const { unparsedMathString, resultString } = rollResult;

        // Parse math string for results.
        const finalRollResult = this.mathParser.evaluate(unparsedMathString);

        if (finalRollResult === undefined)
        {
            await interaction.editReply(`An invalid dicepool was submitted. Include only numbers, plus signs (+), and subtraction signs (-).`);
            return;
        }

        // Run the below separately from the try catch, so errors in super.run don't send an incorrect error message
        const responseMessage = `${Text.Ping.user(rerollCallbackOptions.newCallingUserId ?? interaction.user.id)} :game_die:\n`
            + `${Text.bold(name ?? 'Result')}:${resultString}\n`
            + `${Text.bold('Total')}: ${finalRollResult}`;

        // Send response with reroll button
        await RerollStrategy.run({
            interaction,
            options: responseMessage,
            rerollCallbackOptions,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: `/${this.commandName}`,
        });
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    get description(): string
    {
        return 'Roll a dice pool with any number of any sided dice.';
    }
}

export default new Roll();
