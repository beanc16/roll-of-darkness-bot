const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const options = require('./options/roll');
const rollConstants = require('../constants/roll');
const categoriesSingleton = require('../models/categoriesSingleton');
const DiceService = require('../services/DiceService');
const FlavorTextService = require('../services/FlavorTextService');
const RollResponseFormatterService = require('../services/RollResponseFormatterService');

class Roll extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addIntegerOption(options.numberOfDice)
            // TODO: Add splat parameter
            .addStringOption(options.rerolls)
            .addBooleanOption(options.rote)
            .addIntegerOption(options.exceptionalOn)
            .addIntegerOption(options.extraSuccesses)
            .addBooleanOption(options.advancedAction)
            .addBooleanOption(options.secret);
    }

    async run(interaction)
    {
        // Get initial parameter result
        const isSecret = interaction.options.getBoolean('secret') || false;

        // Send message to show the command was received
        await interaction.deferReply({
            ephemeral: isSecret,
            fetchReply: true,
        });

        // Get parameter results
        const numberOfDice = interaction.options.getInteger('number_of_dice');
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
        const results = diceService.roll();

        // Flavor text
        const flavorTextService = new FlavorTextService();
        await flavorTextService.getFlavorText({
            // TODO: Add splat support
            splat: categoriesSingleton.get('GENERAL'),
            // TODO: Add categories based on roll results success status
        });

        // Response
        const rollResponseFormatterService = new RollResponseFormatterService({
            authorId: interaction.user.id,
            exceptionalOn,
            extraSuccesses,
            isAdvancedAction,
            isRote,
            numberOfDice,
            rerollsDisplay,
            results,
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



module.exports = new Roll();
