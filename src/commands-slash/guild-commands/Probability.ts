import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { RollOfDarknessProbabiltityDiceGetParameters } from '@beanc16/microservices-abstraction';
import { ChatInputCommandInteraction } from 'discord.js';

import DiceProbabilityService from '../../services/DiceProbabilityService.js';
import ProbabilityResponseFormatterService from '../../services/ProbabilityResponseFormatterService.js';
import * as rollOptions from '../Nwod/options/roll.js';
import * as probabilityOptions from '../options/probability.js';
import { numberOfDice as numberOfDiceOption } from '../options/shared.js';

class Probability extends BaseSlashCommand
{
    constructor()
    {
        super();
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addIntegerOption(numberOfDiceOption)
            .addIntegerOption(probabilityOptions.desiredNumberOfSuccesses)
            .addStringOption(rollOptions.rerolls)
            .addBooleanOption(rollOptions.rote)
            .addBooleanOption(rollOptions.advancedAction);
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    public async run(interaction: ChatInputCommandInteraction): Promise<void>
    {
        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const numberOfDice = interaction.options.getInteger('number_of_dice', true);
        const desiredNumberOfSuccesses = interaction.options.getInteger('desired_number_of_successes', true);
        const rerollsKey = interaction.options.getString('rerolls') || rollOptions.rerollChoices['10again'];
        const isRote = interaction.options.getBoolean('rote');
        const isAdvancedAction = interaction.options.getBoolean('advanced_action');

        // Check probability
        const probabilityService = new DiceProbabilityService();
        const {
            cumulativeProbability: probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice,
        } = await probabilityService.getProbabilityOfRolling({
            numberOfDice,
            desiredNumberOfSuccesses,
            rerolls: rollOptions.rerollChoices[
                rerollsKey as keyof typeof rollOptions.rerollChoices
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
                rerolls: rollOptions.rerollChoices[rerollsKey as keyof typeof rollOptions.rerollChoices],
                rote: isRote,
                advancedAction: isAdvancedAction,
                probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice,
            });
            await interaction.editReply(
                probabilityResponseFormatterService.getResponse(),
            );
        }

        else
        {
            await interaction.editReply('Failed to calculate probability.');
        }
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    get description(): string
    {
        return `Check the probability of getting a certain number of successes with a certain number of dice.`;
    }
}

export default new Probability();
