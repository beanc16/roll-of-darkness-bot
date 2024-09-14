import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuRandomSubcommand } from '../../../options/subcommand-groups/ptu/random.js';
import { getLookupMovesEmbedMessages } from '../../../embed-messages/ptu/lookup.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { LookupMoveStrategy } from '../lookup/LookupMoveStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class RandomMetronomeStrategy
{
    public static key = PtuRandomSubcommand.Metronome;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
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

        // Send embed
        await interaction.editReply({
            embeds: [embed],
        });

        return true;
    }
}
