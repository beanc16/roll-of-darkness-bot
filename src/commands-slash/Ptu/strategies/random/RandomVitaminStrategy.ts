import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuRandomSubcommand } from '../../options/random.js';
import type { PtuStrategyMap } from '../../types/strategies.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { PtuRandomPickupSubcommandResponse, PtuRandomPickupSubcommandStrategy } from './types.js';

@staticImplements<PtuRandomPickupSubcommandStrategy>()
export class RandomVitaminStrategy
{
    public static key: PtuRandomSubcommand.Vitamin = PtuRandomSubcommand.Vitamin;

    public static async run(
        interaction: ChatInputCommandInteraction,
        _strategies: PtuStrategyMap,
        shouldReturnMessageOptions = false,
    ): Promise<boolean | PtuRandomPickupSubcommandResponse>
    {
        return await BaseRandomStrategy.run(interaction, this.key, {
            commandName: `/ptu ${PtuSubcommandGroup.Random} ${this.key}`,
        }, undefined, shouldReturnMessageOptions);
    }
}
