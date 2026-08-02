import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { getPagedEmbedBuilders } from '../../../shared/embed-messages/shared.js';
import { PtuQuickReferenceInfo } from '../../options/index.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';

@staticImplements<PtuChatIteractionStrategy>()
export class QrActionTypesStrategy
{
    public static key: PtuQuickReferenceInfo.ActionTypes = PtuQuickReferenceInfo.ActionTypes;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Create the lines of the embed message
        const lines = [
            `${Text.bold('Standard Actions')}:`,
            'Moves and many Features require a Standard Action during your turn to activate and use. Examples of what you can do with a Standard Action:',
            Text.Code.multiLine([
                '» Using a Move.',
                '» Using a Struggle Attack.',
                '» Retrieving and using an Item from a backpack or similar on a target.',
                '» Throwing a Poké Ball to Capture a wild Pokémon.',
                '» Drawing a Weapon, or switching from one Weapon to another.',
                '» Using the Pokédex to identify a Pokémon.',
                '» You may give up a Standard Action to take another Swift Action.',
                '» You may give up a Standard Action to take another Shift Action, but this cannot be used for Movement if you have already used your regular Shift Action for Movement. However, it may be used to activate Features or effects that require a Shift Action.',
                '» Use Combat Maneuvers.',
            ].join('\n')),
            `${Text.bold('Shift Actions')}:`,
            `The Shift Action is the most straightforward action during a Pokémon or Trainer's turn; it's simply used for movement most of the time. Trainers may hand other Trainers a small item they have on hand as part of a Shift Action, as long as the ally is adjacent at either the beginning or end of the shift. A Trainer can also sacrifice their Shift Action to perform certain other actions:`,
            Text.Code.multiLine([
                '» Returning a Pokémon, or sending out a Pokémon',
                '» Returning a Fainted Pokémon and sending out a replacement Pokémon',
            ].join('\n')),
            `${Text.bold('Free Actions')}:`,
            'Many features can be activated as Free Actions. Features with Triggers are often Free Actions. You can activate as many Free Actions as you like, or when they are triggered.',
            '',
            `${Text.bold('Swift Actions')}:`,
            'Trainers have exactly one Swift Action a round, and it can only be used on their turn. Many Features are Swift Actions',
            '',
            `${Text.bold('Extended Actions')}:`,
            'Extended Actions take at least a few minutes to complete, depending on the task. If unspecified, assume at least a few minutes with concentration adequate to the task. Simply, these actions cannot be performed in the middle of combat.',
            '',
            `${Text.bold('Full Actions')}:`,
            'Some Features are Full Actions. Full Actions take both your Standard Action and Shift Action for a turn. The Take a Breather, Coup de Grâce, and Intercept Actions are all Full Actions.',
            '',
            `${Text.bold('Priority Actions')}:`,
            `If the user has not already acted this turn, an action with the Priority keyword may be declared to act immediately; the user takes their full turn, ignoring initiative. This counts as their turn for the round. A priority action may not be declared during someone else's turn; it must be declared between turns. Priority also comes in Priority (Limited) and Priority (Advanced) varieties. The Priority (Limited) keyword is like Priority except the user may not take their full turn; they may only take the action that itself has Priority and take the rest of their turn on their own Initiative Count. For example, Orders are Priority (Limited), meaning the user only uses their Standard Action and does not take a full turn. Priority (Advanced) actions don't require that the user hasn't acted that turn; if they have, they simply give up their turn on the following round.`,
            '',
            `${Text.bold('Interrupt Actions')}:`,
            `Interrupt Moves may be declared in the middle of another combatant's turn to allow the user to take an action. They work similarly to Priority (Advanced, Limited) effects in that they only allow you to take the action that has Interrupt and not a full turn.`,
            '',
            `${Text.bold('Reaction Actions')}:`,
            `Reactions work exactly like Interrupts, except that they happen after the triggering condition is fully resolved, instead of before. Thus, the user must survive the triggering condition to be able to perform the reaction.`,
        ];

        // Parse the text into embed messages
        const embeds = getPagedEmbedBuilders({
            title: 'Action Types',
            pages: [
                lines.join('\n'),
            ],
        });

        // Send the embed messages
        await interaction.editReply({
            embeds,
        });

        return true;
    }
}
