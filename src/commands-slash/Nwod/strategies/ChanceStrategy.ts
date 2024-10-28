import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../strategies/ChatIteractionStrategy.js';
import { staticImplements } from '../../../decorators/staticImplements.js';
import { NwodSubcommand } from '../options/index.js';
import rollConstants from '../../../constants/roll.js';
import { DiceService } from '../../../services/DiceService.js';
import RollResponseFormatterService from '../../../services/RollResponseFormatterService.js';

@staticImplements<ChatIteractionStrategy>()
export class ChanceStrategy
{
    public static key = NwodSubcommand.Chance;

    public static async run(
        interaction: ChatInputCommandInteraction,
    ): Promise<boolean>
    {
        // Get initial parameter result
        const name = interaction.options.getString('name');

        // Get parameter results
        const numberOfDice = 1;
        const rerollsKey = rollConstants.rerollsEnum.no_again.key as keyof typeof rollConstants.rerollsEnum;

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

        // Response
        const rollResponseFormatterService = new RollResponseFormatterService({
            authorId: interaction.user.id,
            dicePoolGroup,
            name,
            numberOfDice,
        });
        await interaction.editReply(
            rollResponseFormatterService.getResponse()
        );
        return true;
    }
}
