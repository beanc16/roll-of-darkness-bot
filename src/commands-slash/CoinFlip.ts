import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import * as options from './options/index.js';
import * as rollOptions from './Nwod/options/roll.js';
import CoinFlipService from '../services/CoinFlipService.js';
import CoinFlipResponseFormatterService from '../services/CoinFlipResponseFormatterService.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from './strategies/RerollStrategy.js';
import { DiscordInteractionCallbackType } from '../types/discord.js';

class CoinFlip extends BaseSlashCommand
{
    private _coinFlipService: CoinFlipService;

    constructor()
    {
        super();
        this._slashCommandData
            .addStringOption(options.coinFlip.headsOrTails)
            .addStringOption(rollOptions.name)
            .addBooleanOption((option) => rollOptions.secret(option, {
                commandType: 'coin flip',
            }));

        this._coinFlipService = new CoinFlipService();
    }

    public async run(
        interaction: ChatInputCommandInteraction,
        {
            interactionCallbackType = DiscordInteractionCallbackType.EditReply,
            newCallingUserId,
        }: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    )
    {
        // Get initial parameter result
        const headsOrTails = interaction.options.getString('heads_or_tails', true);
        const isSecret = interaction.options.getBoolean('secret') || false;
        const name = interaction.options.getString('name');

        // Send message to show the command was received
        if (interactionCallbackType === DiscordInteractionCallbackType.EditReply)
        {
            await interaction.deferReply({
                ephemeral: isSecret,
                fetchReply: true,
            });
        }

        // Flip the coin
        const result = this._coinFlipService.flip();

        // Response
        const coinFlipResponseFormatterService = new CoinFlipResponseFormatterService({
            authorId: newCallingUserId ?? interaction.user.id,
            headsOrTails,
            name,
            result,
        });
        await RerollStrategy.run({
            interaction,
            options: coinFlipResponseFormatterService.getResponse(),
            interactionCallbackType,
            onRerollCallback: (rerollCallbackOptions) => this.run(
                interaction, 
                rerollCallbackOptions
            ),
            commandName: this.commandName,
        });
    }

    get description()
    {
        return `Flip a coin.`;
    }
}



export default new CoinFlip();
