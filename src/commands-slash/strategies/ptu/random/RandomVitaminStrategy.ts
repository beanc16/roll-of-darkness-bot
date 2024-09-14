import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuRandomSubcommand } from '../../../options/subcommand-groups/ptu/random.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class RandomVitaminStrategy
{
    public static key = PtuRandomSubcommand.Vitamin;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        return await BaseRandomStrategy.run(interaction, this.key);
    }
}
