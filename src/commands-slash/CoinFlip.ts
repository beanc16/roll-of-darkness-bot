import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import * as options from './options/index.js';
import CoinFlipService from '../services/CoinFlipService.js';
import CoinFlipResponseFormatterService from '../services/CoinFlipResponseFormatterService.js';
import { ChatInputCommandInteraction } from 'discord.js';

class CoinFlip extends BaseSlashCommand
{
    private _coinFlipService: CoinFlipService;

    constructor()
    {
        super();
        this._slashCommandData
            .addStringOption(options.coinFlip.headsOrTails)
            .addStringOption(options.roll.name)
            .addBooleanOption((option) => options.roll.secret(option, {
                commandType: 'coin flip',
            }));

        this._coinFlipService = new CoinFlipService();
    }

    async run(interaction: ChatInputCommandInteraction)
    {
        // Get initial parameter result
        const headsOrTails = interaction.options.getString('heads_or_tails', true);
        const isSecret = interaction.options.getBoolean('secret') || false;
        const name = interaction.options.getString('name');

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
            name,
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



export default new CoinFlip();
