import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CombatTrackerIteractionStrategy } from '../types/CombatTrackerIteractionStrategy.js';
import { CombatTrackerMessageComponentHandlerParameters } from '../types/CombatTrackerMessageComponentHandlerParameters.js';
import { selectMenuValues } from '../../select-menus/options/combat_tracker.js';
import { awaitCombatTrackerMessageComponents } from '../../message-component-handlers/combat_tracker.js';
import stillWaitingForModalSingleton from '../../../../models/stillWaitingForModalSingleton.js';

@staticImplements<CombatTrackerIteractionStrategy>()
export class ShowSecretCharactersStrategy
{
    public static key = selectMenuValues.showSecretCharacters;

    static async run({
        interaction,
        tracker,
    }: CombatTrackerMessageComponentHandlerParameters): Promise<void>
    {
        // Set command as having started
        stillWaitingForModalSingleton.set(interaction.member?.user.id, false);
        
        await interaction.reply({
            content: 'The ability to show secret characters has not yet been implemented',
            ephemeral: true,
        });

        // Handle the components of the embed message.
        awaitCombatTrackerMessageComponents({
            message: interaction.message,
            tracker,
            user: interaction.user,
        });
    }
}
