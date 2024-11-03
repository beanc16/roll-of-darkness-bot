import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuRandomSubcommand } from '../../subcommand-groups/random.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class RandomVitaminStrategy
{
    public static key = PtuRandomSubcommand.Vitamin;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        return await BaseRandomStrategy.run(interaction, this.key, {
            commandName: `ptu random ${this.key}`,
        });
    }
}
