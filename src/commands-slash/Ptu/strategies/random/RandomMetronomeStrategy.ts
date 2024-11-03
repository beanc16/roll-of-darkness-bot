import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuRandomSubcommand } from '../../subcommand-groups/random.js';
import { getLookupMovesEmbedMessages } from '../../../Ptu/embed-messages/lookup.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { LookupMoveStrategy } from '../lookup/LookupMoveStrategy.js';
import { RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { OnRerollCallbackOptions } from '../../../strategies/RerollStrategy.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';

@staticImplements<ChatIteractionStrategy>()
export class RandomMetronomeStrategy
{
    public static key = PtuRandomSubcommand.Metronome;

    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        const moves = await LookupMoveStrategy.getLookupData({
            exclude: {
                names: [
                    'Struggle',
                    'Hidden Power ',
                    'After You',
                    'Assist',
                    'Bestow',
                    'Copycat',
                    'Counter',
                    'Covet',
                    'Destiny Bond',
                    'Endure',
                    'Feint',
                    'Focus Punch',
                    'Follow Me',
                    'Helping Hand',
                    'Metronome',
                    'Me First',
                    'Mimic',
                    'Mirror Coat',
                    'Mirror Move',
                    'Quash',
                    'Rage Powder',
                    'Sketch',
                    'Sleep Talk',
                    'Snatch',
                    'Snore',
                    'Switcheroo',
                    'Thief',
                    'Transform',
                    'Trick',
                ],
                rangeSearch: 'Shield',
                weaponMovesAndManuevers: true,
            },
        });

        // Get random numbers
        const roll = new DiceLiteService({
            count: 1,
            sides: moves.length,
        }).roll()[0];

        // Get random move
        const move = moves[roll - 1];

        // Get message
        const [embed] = getLookupMovesEmbedMessages([move]);

        // Send embed with reroll button
        await RerollStrategy.run({
            interaction,
            options: {
                embeds: [embed],
            },
            interactionCallbackType: rerollCallbackOptions.interactionCallbackType,
            onRerollCallback: (newRerollCallbackOptions) => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: `ptu random ${this.key}`,
        });

        return true;
    }
}
