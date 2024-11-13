import { staticImplements } from '../../../../decorators/staticImplements.js';
import { AddCharacterModal } from '../../modals/AddCharacter.js';
import { selectMenuValues } from '../../select-menus/options/combat_tracker.js';
import { CombatTrackerIteractionStrategy } from '../types/CombatTrackerIteractionStrategy.js';
import { CombatTrackerMessageComponentHandlerParameters } from '../types/CombatTrackerMessageComponentHandlerParameters.js';

@staticImplements<CombatTrackerIteractionStrategy>()
export class AddCharacterStrategy
{
    public static key = selectMenuValues.addCharacter;

    static async run({
        interaction,
        tracker,
    }: CombatTrackerMessageComponentHandlerParameters): Promise<void>
    {
        // Send the modal.
        await AddCharacterModal.showModal(interaction, tracker);
    }
}
