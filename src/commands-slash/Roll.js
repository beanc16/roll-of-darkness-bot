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
            .addStringOption(options.splat)
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
        // TODO: Make this default splat 
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
        const results = diceService.roll();
        
        // TODO: Abstract this some container for all dice pools later and make it better
        const biggestResult = results.reduce(function (acc, cur)
        {
            if (cur.numOfSuccesses > acc.numOfSuccesses)
            {
                acc = cur;
            }

            return acc;
        }, results[0]);

        // Flavor text
        const flavorTextService = new FlavorTextService();
        const flavorText = await flavorTextService.getRandomFlavorText({
            splat,
            categories: [
                biggestResult.successStatus,
            ],
        });

        // Response
        const rollResponseFormatterService = new RollResponseFormatterService({
            authorId: interaction.user.id,
            exceptionalOn,
            extraSuccesses,
            flavorText,
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
