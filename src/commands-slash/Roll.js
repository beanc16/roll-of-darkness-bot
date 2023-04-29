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
                option.setDescription('The number of dice to roll');
                option.setMinValue(1);
                option.setMaxValue(100);
                return option;
            });
    }

    async run(interaction)
    {
        // Send message to show the command was received
        await interaction.deferReply({ fetchReply: true });

        // Get parameter results
        const numberOfDice = interaction.options.getInteger('number_of_dice');

        // Roll the dice
        const diceService = new DiceService({ count: numberOfDice });
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
