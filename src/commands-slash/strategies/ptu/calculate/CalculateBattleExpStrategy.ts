import { ChatInputCommandInteraction } from 'discord.js';
import { Parser } from 'expr-eval';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuCalculateSubcommand } from '../../../options/subcommand-groups/ptu/calculate.js';
import { addMathParserOptions } from '../../../../constants/mathParserOptions.js';

@staticImplements<ChatIteractionStrategy>()
export class CalculateBattleExpStrategy
{
    private static mathParser = new Parser(addMathParserOptions);
    public static key = PtuCalculateSubcommand.BattleExp;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const totalLevelsOfEnemiesFormula = interaction.options.getString('total_levels_of_enemies', true);
        const significanceMultiplier = interaction.options.getNumber('significance_multiplier', true);
        const numOfPlayers = interaction.options.getInteger('num_of_players', true);

        // Calculate the total levels of enemies
        let totalLevelOfEnemies: number;
        try {
            totalLevelOfEnemies = this.mathParser.evaluate(totalLevelsOfEnemiesFormula);
        } catch (err) {
            // Don't log any errors. This will occur if users input an invalid mathematical expression. We don't want to log errors from user-driven behavior.
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
