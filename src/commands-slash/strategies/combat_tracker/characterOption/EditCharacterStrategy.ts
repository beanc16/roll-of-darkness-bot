import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CombatTrackerIteractionStrategy } from '../types/CombatTrackerIteractionStrategy.js';
import { CombatTrackerMessageComponentHandlerParameters } from '../types/CombatTrackerMessageComponentHandlerParameters.js';
import { selectMenuValues } from '../../../select-menus/options/combat_tracker.js';
import { awaitCombatTrackerMessageComponents } from '../../../message-component-handlers/combat_tracker.js';

@staticImplements<CombatTrackerIteractionStrategy>()
export class EditCharacterStrategy
{
    public static key = selectMenuValues.editCharacter;

    static async run({
        interaction,
        tracker,
    }: CombatTrackerMessageComponentHandlerParameters): Promise<void>
    {
        await interaction.reply({
            content: 'The ability to edit a character has not yet been implemented',
            ephemeral: true,
        });
    
        // Handle the components of the embed message.
        awaitCombatTrackerMessageComponents({
            message: interaction.message,
            tracker,
        });
    }
}
