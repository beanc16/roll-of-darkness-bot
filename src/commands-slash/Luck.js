const SplatSlashCommand = require('./base-commands/SplatSlashCommand');
const options = require('./options/roll');
const DiceService = require('../services/DiceService');
const FlavorTextService = require('../services/FlavorTextService');
const RollResponseFormatterService = require('../services/RollResponseFormatterService');

class Luck extends SplatSlashCommand
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
        // For flavor text handling
        const flavorTextService = new FlavorTextService();

        // Get initial parameter result
        const splat = interaction.options.getString('splat') || await flavorTextService.getCategory('GENERAL');
        const isSecret = interaction.options.getBoolean('secret') || false;
        const name = interaction.options.getString('name');

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
            numberOfDice,
            name,
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
