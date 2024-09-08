import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CombatTrackerIteractionStrategy } from '../types/CombatTrackerIteractionStrategy.js';
import { CombatTrackerMessageComponentHandlerParameters } from '../types/CombatTrackerMessageComponentHandlerParameters.js';
import { selectMenuValues } from '../../../select-menus/options/combat_tracker.js';
import { RemoveCharacterModal } from '../../../../modals/combat-tracker/RemoveCharacter.js';

@staticImplements<CombatTrackerIteractionStrategy>()
export class RemoveCharacterStrategy
{
    public static key = selectMenuValues.removeCharacter;

    static async run({
        interaction,
        tracker,
    }: CombatTrackerMessageComponentHandlerParameters): Promise<void>
    {
        // Send the modal.
        await RemoveCharacterModal.showModal(interaction, tracker);
    }
}
