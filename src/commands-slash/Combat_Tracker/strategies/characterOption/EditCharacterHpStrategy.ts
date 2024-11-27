/* eslint-disable import/no-cycle */ // TODO: Fix this later.
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { EditCharacterHpModal } from '../../modals/EditCharacterHp.js';
import { selectMenuValues } from '../../select-menus/options/combat_tracker.js';
import { CombatTrackerIteractionStrategy } from '../types/CombatTrackerIteractionStrategy.js';
import { CombatTrackerMessageComponentHandlerParameters } from '../types/CombatTrackerMessageComponentHandlerParameters.js';

@staticImplements<CombatTrackerIteractionStrategy>()
export class EditCharacterHpStrategy
{
    public static key = selectMenuValues.editHp;

    public static async run({ interaction, tracker }: CombatTrackerMessageComponentHandlerParameters): Promise<void>
    {
        // Send the modal.
        await EditCharacterHpModal.showModal(interaction, tracker);
    }
}
