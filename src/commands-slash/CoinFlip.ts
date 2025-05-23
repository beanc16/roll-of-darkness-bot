import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { DiceService } from '../services/DiceService.js';
import { DiscordInteractionCallbackType } from '../types/discord.js';
import * as rollOptions from './Nwod/options/roll.js';
import * as options from './options/index.js';
import { OnRerollCallbackOptions, RerollStrategy } from './strategies/RerollStrategy.js';

enum CoinFlipResult
{
    Heads = 'heads',
    Tails = 'tails',
}

class CoinFlip extends BaseSlashCommand
{
    private diceService: DiceService;

    constructor()
    {
        super();
        // eslint-disable-next-line no-underscore-dangle -- TODO: Update this in downstream package later
        this._slashCommandData
            .addStringOption(options.coinFlip.headsOrTails)
            .addStringOption(rollOptions.name)
            .addBooleanOption(option => rollOptions.secret(option, {
                commandType: 'coin flip',
            }));

        this.diceService = new DiceService({
            sides: 2,
        });
    }

    public async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<void>
    {
        // Get initial parameter result
        const headsOrTails = interaction.options.getString('heads_or_tails', true);
        const isSecret = interaction.options.getBoolean('secret') || false;
        const name = interaction.options.getString('name');

        // Send message to show the command was received
        if (rerollCallbackOptions.interactionCallbackType === DiscordInteractionCallbackType.EditReply)
        {
            await interaction.deferReply({
                ephemeral: isSecret,
                fetchReply: true,
            });
        }

        // Flip the coin
        const result = this.flipCoin();

        // Response
        await RerollStrategy.run({
            interaction,
            options: CoinFlip.getResponse({
                authorId: rerollCallbackOptions.newCallingUserId ?? interaction.user.id,
                headsOrTails,
                name,
                result,
            }),
            rerollCallbackOptions,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: `/${this.commandName}`,
        });
    }

    // eslint-disable-next-line class-methods-use-this -- Leave as non-static
    get description(): string
    {
        return `Flip a coin.`;
    }

    private flipCoin(): CoinFlipResult
    {
        const result = this.diceService.roll();

        if (result.get(0).rolls[0][0].number === 1)
        {
            return CoinFlipResult.Heads;
        }

        return CoinFlipResult.Tails;
    }

    /* istanbul ignore next */
    private static getResponse({
        authorId,
        headsOrTails,
        name,
        result,
    }: {
        authorId: string;
        headsOrTails: string;
        name?: string | null;
        result: CoinFlipResult;
    }): string
    {
        const rollName = (name) ? ` for ${name}` : '';

        return `${Text.Ping.user(authorId)} flipped a coin, `
            + `predicted that it would be ${Text.bold(headsOrTails)}, `
            + ` and got ${Text.bold(result)}${rollName}.`;
    }
}

export default new CoinFlip();
