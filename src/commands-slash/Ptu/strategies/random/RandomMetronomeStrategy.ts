import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { getLookupMovesEmbedMessages } from '../../embed-messages/lookup.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuRandomSubcommand } from '../../options/random.js';
import type { PtuChatIteractionStrategy, PtuStrategyMap } from '../../types/strategies.js';
import { LookupMoveStrategy } from '../lookup/LookupMoveStrategy.js';

@staticImplements<PtuChatIteractionStrategy>()
export class RandomMetronomeStrategy
{
    public static key: PtuRandomSubcommand.Metronome = PtuRandomSubcommand.Metronome;

    public static async run(
        interaction: ChatInputCommandInteraction,
        strategies: PtuStrategyMap,
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
            rerollCallbackOptions,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                strategies,
                newRerollCallbackOptions,
            ),
            commandName: `/ptu ${PtuSubcommandGroup.Random} ${this.key}`,
        });

        return true;
    }
}
