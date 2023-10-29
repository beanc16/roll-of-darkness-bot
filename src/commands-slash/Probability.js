const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const options = require('./options');
const DiceProbabilityService = require('../services/DiceProbabilityService');
const ProbabilityResponseFormatterService = require('../services/ProbabilityResponseFormatterService');

class Probability extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addIntegerOption(options.roll.numberOfDice)
            .addIntegerOption(options.probability.desiredNumberOfSuccesses);
    }

    async run(interaction)
    {
        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const numberOfDice = interaction.options.getInteger('number_of_dice');
        const desiredNumberOfSuccesses = interaction.options.getInteger('desired_number_of_successes');

        if (desiredNumberOfSuccesses > numberOfDice) {
            await interaction.editReply(
                'Invalid parameters were submitted. Desired number of successes ' +
                'must be less than or equal to number of dice, but ' +
                `a desired number of successes of ${desiredNumberOfSuccesses} ` +
                `were given with ${numberOfDice} dice.`
            );
        } else {
            // Check probability
            const probabilityService = new DiceProbabilityService();
            const probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice = probabilityService.getProbabilityOfRolling({
                numberOfDice,
                desiredNumberOfSuccesses,
            });

            // Response
            const probabilityResponseFormatterService = new ProbabilityResponseFormatterService({
                authorId: interaction.user.id,
                desiredNumberOfSuccesses,
                numberOfDice,
                probabilityOfRollingTheDesiredNumberOfSuccessesWithTheGivenNumberOfDice,
            });
            await interaction.editReply(
                probabilityResponseFormatterService.getResponse()
            );
        }
    }

    get description()
    {
        return `Check the probability of getting a certain number of successes with a certain number of dice.`;
    }
}



module.exports = new Probability();
