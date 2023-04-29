const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const { Text } = require('@beanc16/discordjs-helpers');
const rollConstants = require('../constants/roll');
const DiceService = require('../services/DiceService');
const RollResponseFormatterService = require('../services/RollResponseFormatterService');

class Roll extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
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
            });
    }

    async run(interaction)
    {
        // Send message to show the command was received
        await interaction.deferReply({ fetchReply: true });

        // Get parameter results
        const numberOfDice = interaction.options.getInteger('number_of_dice');
        const rerollsKey = interaction.options.getString('rerolls');
        const isRote = interaction.options.getBoolean('rote');

        // TODO: Make a service for converting enums to necessary outputs later
        // Convert parameters to necessary inputs for service calls
        const rerollOnGreaterThanOrEqualTo = rollConstants.rerollsEnum[rerollsKey];

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
            numberOfDice,
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
