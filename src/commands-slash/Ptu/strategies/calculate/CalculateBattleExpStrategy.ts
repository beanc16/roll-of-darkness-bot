import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { AddMathParser } from '../../../../services/MathParser/AddMathParser.js';
import { PtuCalculateSubcommand } from '../../options/calculate.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';

@staticImplements<PtuChatIteractionStrategy>()
export class CalculateBattleExpStrategy
{
    private static mathParser = new AddMathParser();
    public static key: PtuCalculateSubcommand.BattleExp = PtuCalculateSubcommand.BattleExp;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const totalLevelsOfEnemiesFormula = interaction.options.getString('total_levels_of_enemies', true);
        const significanceMultiplier = interaction.options.getNumber('significance_multiplier', true);
        const numOfPlayers = interaction.options.getInteger('num_of_players', true);

        // Calculate the total levels of enemies
        const totalLevelOfEnemies = this.mathParser.evaluate(totalLevelsOfEnemiesFormula);

        if (totalLevelOfEnemies === undefined)
        {
            await interaction.editReply(
                'An invalid dicepool was submitted. Include only numbers and plus signs (+).',
            );
            return true;
        }

        // Calculate the total experience
        const totalExperience = Math.round(totalLevelOfEnemies * significanceMultiplier / numOfPlayers);

        // Send message
        await interaction.editReply(
            `Each player gets ${totalExperience} exp to split between the Pokémon that they used.`,
        );

        return true;
    }
}
