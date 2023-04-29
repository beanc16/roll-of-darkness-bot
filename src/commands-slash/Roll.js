const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const rollConstants = require('../constants/roll');
const DiceService = require('../services/DiceService');
const RollResponseFormatterService = require('../services/RollResponseFormatterService');

class Roll extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            // TODO: Put these options into a new file somewhere else later
            .addIntegerOption(function (option)
            {
                option.setName('number_of_dice');
                option.setDescription('The number of dice to roll (default: 1)');
                option.setMinValue(1);
                option.setMaxValue(100);
                return option;
            })
            .addStringOption(function (option)
            {
                option.setName('rerolls');
                option.setDescription('The minimum value that dice reroll on (default: reroll 10s)');
                option.addChoices(
                    {
                        name: '9again',
                        value: 'nine_again',
                    },
                    {
                        name: '8again',
                        value: 'eight_again',
                    },
                    {
                        name: 'noagain',
                        value: 'no_again',
                    },
                );
                return option;
            })
            .addBooleanOption(function (option)
            {
                option.setName('rote');
                option.setDescription('Failed rolls are rerolled once (default: false)');
                return option;
            })
            .addIntegerOption(function (option)
            {
                option.setName('extra_successes');
                option.setDescription('The number of successes to add to your result - useful for weapon rating (default: 0)');
                option.setMinValue(1);
                option.setMaxValue(100);
                return option;
            })
            .addBooleanOption(function (option)
            {
                option.setName('secret');
                option.setDescription('Makes a temporary roll message that only you can see (default: false)');
                return option;
            });
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
        const extraSuccesses = interaction.options.getInteger('extra_successes');

        // Convert parameters to necessary inputs for service calls
        const rerollOnGreaterThanOrEqualTo = rollConstants.rerollsEnum[rerollsKey]?.number;
        const rerollsDisplay = rollConstants.rerollsEnum[rerollsKey]?.display;

        // Roll the dice
        const diceService = new DiceService({
            count: numberOfDice,
            rerollOnGreaterThanOrEqualTo,
            isRote,
        });
        const results = diceService.roll();

        // Response
        const rollResponseFormatterService = new RollResponseFormatterService({
            authorId: interaction.user.id,
            extraSuccesses,
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
