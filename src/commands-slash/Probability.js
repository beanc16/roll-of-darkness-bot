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
            .addIntegerOption(options.probability.desiredNumberOfSuccesses)
            .addStringOption(options.roll.rerolls)
            .addBooleanOption(options.roll.rote)
            .addBooleanOption(options.roll.advancedAction);
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
            rerolls: options.roll.rerollChoices[rerollsKey],
            rote: isRote,
            advancedAction: isAdvancedAction,
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

    get description()
    {
        return `Check the probability of getting a certain number of successes with a certain number of dice.`;
    }
}



module.exports = new Probability();
