const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const options = require('./options');
const CoinFlipService = require('../services/CoinFlipService');
const CoinFlipResponseFormatterService = require('../services/CoinFlipResponseFormatterService');

class CoinFlip extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addStringOption(options.coinFlip.headsOrTails)
            .addBooleanOption((option) => options.roll.secret(option, {
                commandType: 'coin flip',
            }));

        this._coinFlipService = new CoinFlipService();
    }

    async run(interaction)
    {
        // Get initial parameter result
        const headsOrTails = interaction.options.getString('heads_or_tails') || false;
        const isSecret = interaction.options.getBoolean('secret') || false;

        // Send message to show the command was received
        await interaction.deferReply({
            ephemeral: isSecret,
            fetchReply: true,
        });

        // Flip the coin
        const result = this._coinFlipService.flip();

        // Flavor text
        // TODO: Do this later after adding categories for coin flip flavor text
        /*
        const flavorTextService = new FlavorTextService();
        const flavorText = await flavorTextService.getRandomFlavorText({
            splat,
            categories: [
                dicePoolGroup.getBiggestResult().successStatus,
            ],
        });
        */

        // Response
        const coinFlipResponseFormatterService = new CoinFlipResponseFormatterService({
            authorId: interaction.user.id,
            headsOrTails,
            result,
        })
        await interaction.editReply(
            coinFlipResponseFormatterService.getResponse()
        );
    }

    get description()
    {
        return `Flip a coin.`;
    }
}



module.exports = new CoinFlip();
