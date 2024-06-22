const SplatSlashCommand = require('./SplatSlashCommand');
const options = require('../options');
const rollConstants = require('../../constants/roll');
const DiceService = require('../../services/DiceService');
const FlavorTextService = require('../../services/FlavorTextService');
const RollResponseFormatterService = require('../../services/RollResponseFormatterService');

class BaseRollCommand extends SplatSlashCommand
{
    constructor({
        firstParameter = {
            type: 'integer',
            value: options.roll.numberOfDice
        },
    } = {})
    {
        super();

        // Set up the first parameter
        if (firstParameter && firstParameter.type === 'integer') {
            this._slashCommandData
                .addIntegerOption(firstParameter.value);
        } else if (firstParameter && firstParameter.type === 'string') {
            this._slashCommandData
                .addStringOption(firstParameter.value);
        } else if (firstParameter && firstParameter.type === 'boolean') {
            this._slashCommandData
                .addBooleanOption(firstParameter.value);
        }

        this._slashCommandData
            .addStringOption(options.roll.name)
            .addStringOption(options.roll.rerolls)
            .addBooleanOption(options.roll.rote)
            .addIntegerOption(options.roll.exceptionalOn)
            .addIntegerOption(options.roll.diceToReroll)
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

        // For flavor text handling
        const flavorTextService = new FlavorTextService();

        // Get parameter results
        const splat = interaction.options.getString('splat') || await flavorTextService.getCategory('GENERAL');
        const name = interaction.options.getString('name');
        const rerollsKey = interaction.options.getString('rerolls');
        const isRote = interaction.options.getBoolean('rote');
        const exceptionalOn = interaction.options.getInteger('exceptional_on');
        const diceToReroll = interaction.options.getInteger('dice_to_reroll');
        const isAdvancedAction = interaction.options.getBoolean('advanced_action');
        const extraSuccesses = interaction.options.getInteger('extra_successes');

        // Convert parameters to necessary inputs for service calls
        const rerollOnGreaterThanOrEqualTo = rollConstants.rerollsEnum[rerollsKey]?.number;
        const rerollsDisplay = rollConstants.rerollsEnum[rerollsKey]?.display;

        // Roll the dice
        const diceService = new DiceService({
            count: numberOfDice,
            rerollOnGreaterThanOrEqualTo,
            exceptionalOn,
            diceToReroll,
            isRote,
            isAdvancedAction,
            extraSuccesses,
        });
        const dicePoolGroup = diceService.roll();

        // Flavor text
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
            diceToReroll,
            exceptionalOn,
            extraSuccesses,
            flavorText,
            isAdvancedAction,
            isRote,
            name,
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
