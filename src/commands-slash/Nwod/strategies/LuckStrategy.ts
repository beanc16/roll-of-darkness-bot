import { ChatInputCommandInteraction } from 'discord.js';

import rollConstants from '../../../constants/roll.js';
import { staticImplements } from '../../../decorators/staticImplements.js';
import { DiceService } from '../../../services/DiceService.js';
import { DiscordInteractionCallbackType } from '../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../strategies/RerollStrategy.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { NwodSubcommand } from '../options/index.js';
import RollResponseFormatterService from '../services/RollResponseFormatterService.js';

@staticImplements<ChatIteractionStrategy>()
export class LuckStrategy
{
    public static key: NwodSubcommand.Luck = NwodSubcommand.Luck;

    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        // Get initial parameter result
        const name = interaction.options.getString('name');

        // Get parameter results
        const numberOfDice = 3;

        // Roll the dice
        const diceService = new DiceService({
            count: numberOfDice,
            // Don't reroll
            rerollOnGreaterThanOrEqualTo: rollConstants.rerollsEnum.no_again.number,
        });
        const dicePoolGroup = diceService.roll();

        // Response
        const rollResponseFormatterService = new RollResponseFormatterService({
            authorId: rerollCallbackOptions.newCallingUserId ?? interaction.user.id,
            dicePoolGroup,
            numberOfDice,
            name,
        });
        await RerollStrategy.run({
            interaction,
            options: rollResponseFormatterService.getResponse(),
            rerollCallbackOptions,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: `/nwod ${NwodSubcommand.Luck}`,
        });
        return true;
    }
}
