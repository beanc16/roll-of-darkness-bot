const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const options = require('./options/roll');
const DiceService = require('../services/DiceService');
const RollResponseFormatterService = require('../services/RollResponseFormatterService');

class Luck extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
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
        const numberOfDice = 3;

        // Roll the dice
        const diceService = new DiceService({
            count: numberOfDice,
        });
        const results = diceService.roll();

        // TODO: Add flavor text

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
        return `Roll three d10s with no extra modifiers.`;
    }
}



module.exports = new Luck();
