import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuCalculateSubcommand } from '../../subcommand-groups/calculate.js';
import { AddMathParser } from '../../../../services/MathParser/AddMathParser.js';

@staticImplements<ChatIteractionStrategy>()
export class CalculateBattleExpStrategy
{
    private static mathParser = new AddMathParser();
    public static key = PtuCalculateSubcommand.BattleExp;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
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
                'An invalid dicepool was submitted. Include only numbers and plus signs (+).'
            );
            return true;
        }

        // Calculate the total experience
        const totalExperience = Math.round(totalLevelOfEnemies * significanceMultiplier / numOfPlayers);

        // Send message
        await interaction.editReply({
            content: `Each player gets ${totalExperience} exp to split between the Pokémon that they used.`,
        });

        return true;
    }
}
