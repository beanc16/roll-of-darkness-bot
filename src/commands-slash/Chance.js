const SplatSlashCommand = require('./base-commands/SplatSlashCommand');
const options = require('./options/roll');
const rollConstants = require('../constants/roll');
const DiceService = require('../services/DiceService');
const FlavorTextService = require('../services/FlavorTextService');
const RollResponseFormatterService = require('../services/RollResponseFormatterService');

class Chance extends SplatSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addStringOption(options.name)
            .addBooleanOption(options.secret);
    }

    async run(interaction)
    {
        // Get initial parameter result
        const isSecret = interaction.options.getBoolean('secret') || false;
        const name = interaction.options.getString('name');

        // Send message to show the command was received
        await interaction.deferReply({
            ephemeral: isSecret,
            fetchReply: true,
        });

        // For flavor text handling
        const flavorTextService = new FlavorTextService();

        // Get parameter results
        const numberOfDice = 1;
        const splat = interaction.options.getString('splat') || await flavorTextService.getCategory('GENERAL');
        const rerollsKey = rollConstants.rerollsEnum.no_again.key;

        // Convert parameters to necessary inputs for service calls
        const rerollOnGreaterThanOrEqualTo = rollConstants.rerollsEnum[rerollsKey]?.number;

        // Roll the dice
        const diceService = new DiceService({
            count: numberOfDice,
            rerollOnGreaterThanOrEqualTo,
            successOnGreaterThanOrEqualTo: 10,
            canBeDramaticFailure: true,
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
            flavorText,
            name,
            numberOfDice,
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
