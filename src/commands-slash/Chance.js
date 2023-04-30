const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const options = require('./options/roll');
const rollConstants = require('../constants/roll');
const DiceService = require('../services/DiceService');
const RollResponseFormatterService = require('../services/RollResponseFormatterService');

class Chance extends BaseSlashCommand
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
        const numberOfDice = 1;
        const rerollsKey = rollConstants.rerollsEnum.no_again.key;

        // Convert parameters to necessary inputs for service calls
        const rerollOnGreaterThanOrEqualTo = rollConstants.rerollsEnum[rerollsKey]?.number;

        // Roll the dice
        const diceService = new DiceService({
            count: numberOfDice,
            rerollOnGreaterThanOrEqualTo,
            successOnGreaterThanOrEqualTo: 10,
        });
        const results = diceService.roll();

        // Response
        const rollResponseFormatterService = new RollResponseFormatterService({
            authorId: interaction.user.id,
            numberOfDice,
            results,
            successOnGreaterThanOrEqualTo: 10,
        });
        await interaction.editReply(
            rollResponseFormatterService.getResponse()
        );
    }

    get description()
    {
        return `Roll one d10 with no rerolls or modifiers.`;
    }
}



module.exports = new Chance();
