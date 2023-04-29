const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const diceService = require('../services/DiceService');
const DiceService = require('../services/DiceService');

class Roll extends BaseSlashCommand
{
    async run(interaction)
    {
        // Send message to show the command was received
        await interaction.deferReply({
            ephemeral: true,
            fetchReply: true,
        });

        // Roll the dice
        const diceService = new DiceService({ count: 6 });
        const results = diceService.roll();

        // Update message
        await interaction.editReply(results.flat().join(', '));
    }

    get description()
    {
        return `Show the latency between this bot and the Discord API.`;
    }
}



module.exports = new Roll();
