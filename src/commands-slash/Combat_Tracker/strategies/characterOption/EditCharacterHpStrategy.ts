import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CombatTrackerIteractionStrategy } from '../types/CombatTrackerIteractionStrategy.js';
import { CombatTrackerMessageComponentHandlerParameters } from '../types/CombatTrackerMessageComponentHandlerParameters.js';
import { EditCharacterHpModal } from '../../modals/EditCharacterHp.js';
import { selectMenuValues } from '../../../select-menus/options/combat_tracker.js';

@staticImplements<CombatTrackerIteractionStrategy>()
export class EditCharacterHpStrategy
{
    public static key = selectMenuValues.editHp;

    static async run({
        interaction,
        tracker,
    }: CombatTrackerMessageComponentHandlerParameters): Promise<void>
    {
        // Send the modal.
        await EditCharacterHpModal.showModal(interaction, tracker);
    }
}
