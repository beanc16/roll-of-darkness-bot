const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const DiceService = require('../services/DiceService');
const { SlashCommandBuilder } = require('discord.js');

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
            })
    }

    async run(interaction)
    {
        // Send message to show the command was received
        await interaction.deferReply({
            ephemeral: true,
            fetchReply: true,
        });

        const numberOfDice = interaction.options.getInteger('number_of_dice');

        // Roll the dice
        const diceService = new DiceService({ count: numberOfDice });
        const results = diceService.roll();

        // Update message
        await interaction.editReply(results.flat().join(', '));
    }

    get description()
    {
        return `Roll d10s.`;
    }
}



module.exports = new Roll();
