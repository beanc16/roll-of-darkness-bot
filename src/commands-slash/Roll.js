const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const { Text } = require('@beanc16/discordjs-helpers');
const rollConstants = require('../constants/roll');
const DiceService = require('../services/DiceService');

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

        // TODO: Make a service out of formatting the command output to a string
        const authorPing = Text.Ping.user(interaction.user.id);
        const numOfSuccesses = results.flat().filter((result) => result >= 8).length;

        const diceString = results.reduce(function (acc, result)
        {
            // Add commas to the end of the previous success except for the first
            if (acc !== '')
            {
                acc += ', ';
            }

            acc += `${result[0]}`;

            // Add parenthesis around dice that were rolled after an explosion
            for (let i = 1; i < result.length; i++)
            {
                acc += ` (${result[i]})`;
            }

            return acc;
        }, '');

        await interaction.editReply(
            `${authorPing} rolled ${numberOfDice || rollConstants.defaultParams.count} dice and got ${Text.bold(`${numOfSuccesses} ${
                (numOfSuccesses !== 1)
                ? 'successes'
                : 'success'
            }`)}. ${diceString}`
        );
    }

    get description()
    {
        return `Roll d10s.`;
    }
}



module.exports = new Roll();
