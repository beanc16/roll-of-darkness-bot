/* eslint-disable import/no-cycle */ // TODO: Fix this later.
import { staticImplements } from '../../../../decorators/staticImplements.js';
import stillWaitingForModalSingleton from '../../../../models/stillWaitingForModalSingleton.js';
import { awaitCombatTrackerMessageComponents } from '../../message-component-handlers/combat_tracker.js';
import { selectMenuValues } from '../../select-menus/options/combat_tracker.js';
import { CombatTrackerIteractionStrategy } from '../types/CombatTrackerIteractionStrategy.js';
import { CombatTrackerMessageComponentHandlerParameters } from '../types/CombatTrackerMessageComponentHandlerParameters.js';

@staticImplements<CombatTrackerIteractionStrategy>()
export class EditCharacterStrategy
{
    public static key = selectMenuValues.editCharacter;

    public static async run({ interaction, tracker }: CombatTrackerMessageComponentHandlerParameters): Promise<void>
    {
        // Set command as having started
        stillWaitingForModalSingleton.upsert(interaction.member?.user.id, false);

        await interaction.reply({
            content: 'The ability to edit a character has not yet been implemented',
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
