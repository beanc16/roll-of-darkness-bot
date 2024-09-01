import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { ChatInputCommandInteraction } from 'discord.js';

import * as options from '../options/index.js';
import DiceProbabilityService from '../../services/DiceProbabilityService.js';
import ProbabilityResponseFormatterService from '../../services/ProbabilityResponseFormatterService.js';
import { RollOfDarknessProbabiltityDiceGetParameters } from '@beanc16/microservices-abstraction';

class Probability extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addIntegerOption(options.roll.numberOfDice)
            .addIntegerOption(options.probability.desiredNumberOfSuccesses)
            .addStringOption(options.roll.rerolls)
            .addBooleanOption(options.roll.rote)
            .addBooleanOption(options.roll.advancedAction);
    }

    async run(interaction: ChatInputCommandInteraction)
    {
        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const numberOfDice = interaction.options.getInteger('number_of_dice', true);
        const desiredNumberOfSuccesses = interaction.options.getInteger('desired_number_of_successes', true);
        const rerollsKey = interaction.options.getString('rerolls') || options.roll.rerollChoices['10again'];
        const isRote = interaction.options.getBoolean('rote');
        const isAdvancedAction = interaction.options.getBoolean('advanced_action');

        // Check probability
        const probabilityService = new DiceProbabilityService();
        const {
            cumulativeProbability: probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice,
        } = await probabilityService.getProbabilityOfRolling({
            numberOfDice,
            desiredNumberOfSuccesses,
            rerolls: options.roll.rerollChoices[
                rerollsKey as keyof typeof options.roll.rerollChoices
            ] as RollOfDarknessProbabiltityDiceGetParameters['rerolls'],
            rote: isRote,
            advancedAction: isAdvancedAction,
        });

        if (!probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice)
        {
            // Response
            const probabilityResponseFormatterService = new ProbabilityResponseFormatterService({
                authorId: interaction.user.id,
                desiredNumberOfSuccesses,
                numberOfDice,
                rerolls: options.roll.rerollChoices[rerollsKey as keyof typeof options.roll.rerollChoices],
                rote: isRote,
                advancedAction: isAdvancedAction,
                probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice,
            });
            await interaction.editReply(
                probabilityResponseFormatterService.getResponse()
            );
        }

        else
        {
            await interaction.editReply('Failed to calculate probability.');
        }
    }

    get description()
    {
        return `Check the probability of getting a certain number of successes with a certain number of dice.`;
    }
}



export default new Probability();
