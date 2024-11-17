import { staticImplements } from '../../../../decorators/staticImplements.js';
import { RemoveCharacterModal } from '../../modals/RemoveCharacter.js';
import { selectMenuValues } from '../../select-menus/options/combat_tracker.js';
import { CombatTrackerIteractionStrategy } from '../types/CombatTrackerIteractionStrategy.js';
import { CombatTrackerMessageComponentHandlerParameters } from '../types/CombatTrackerMessageComponentHandlerParameters.js';

@staticImplements<CombatTrackerIteractionStrategy>()
export class RemoveCharacterStrategy
{
    public static key = selectMenuValues.removeCharacter;

    public static async run({ interaction, tracker }: CombatTrackerMessageComponentHandlerParameters): Promise<void>
    {
        // Send the modal.
        await RemoveCharacterModal.showModal(interaction, tracker);
    }
}
