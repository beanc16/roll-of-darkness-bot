const SplatSlashCommand = require('./SplatSlashCommand');
const options = require('../options');
const rollConstants = require('../../constants/roll');
const categoriesSingleton = require('../../models/categoriesSingleton');
const DiceService = require('../../services/DiceService');
const FlavorTextService = require('../../services/FlavorTextService');
const RollResponseFormatterService = require('../../services/RollResponseFormatterService');

class BaseRollCommand extends SplatSlashCommand
{
    constructor({
        firstParameter = options.roll.numberOfDice,
    } = {})
    {
        super();
        this._slashCommandData
            .addIntegerOption(firstParameter)
            .addStringOption(options.roll.rerolls)
            .addBooleanOption(options.roll.rote)
            .addIntegerOption(options.roll.exceptionalOn)
            .addIntegerOption(options.roll.extraSuccesses)
            .addBooleanOption(options.roll.advancedAction)
            .addBooleanOption(options.roll.secret);
    }

    async run(interaction, {
        numberOfDice = interaction.options.getInteger('number_of_dice'),
    } = {})
    {
        // Get initial parameter result
        const isSecret = interaction.options.getBoolean('secret') || false;

        // Send message to show the command was received
        await interaction.deferReply({
            ephemeral: isSecret,
            fetchReply: true,
        });

        // Get parameter results
        const splat = interaction.options.getString('splat') || categoriesSingleton.get('GENERAL');
        const rerollsKey = interaction.options.getString('rerolls');
        const isRote = interaction.options.getBoolean('rote');
        const exceptionalOn = interaction.options.getInteger('exceptional_on');
        const isAdvancedAction = interaction.options.getBoolean('advanced_action');
        const extraSuccesses = interaction.options.getInteger('extra_successes');

        // Convert parameters to necessary inputs for service calls
        const rerollOnGreaterThanOrEqualTo = rollConstants.rerollsEnum[rerollsKey]?.number;
        const rerollsDisplay = rollConstants.rerollsEnum[rerollsKey]?.display;

        // Roll the dice
        const diceService = new DiceService({
            count: numberOfDice,
            rerollOnGreaterThanOrEqualTo,
            isRote,
            isAdvancedAction,
        });
        const dicePoolGroup = diceService.roll();

        // Flavor text
        const flavorTextService = new FlavorTextService();
        const flavorText = await flavorTextService.getRandomFlavorText({
            splat,
            categories: [
                dicePoolGroup.getBiggestResult().successStatus,
            ],
        });

        // Response
        const rollResponseFormatterService = new RollResponseFormatterService({
            authorId: interaction.user.id,
            dicePoolGroup,
            exceptionalOn,
            extraSuccesses,
            flavorText,
            isAdvancedAction,
            isRote,
            numberOfDice,
            rerollsDisplay,
        });
        await interaction.editReply(
            rollResponseFormatterService.getResponse()
        );
    }

    get description()
    {
        return `Roll d10s.`;
    }
}



module.exports = BaseRollCommand;
