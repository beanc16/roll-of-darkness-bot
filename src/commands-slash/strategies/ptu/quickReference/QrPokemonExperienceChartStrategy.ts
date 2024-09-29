import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { BaseQuickReferenceStrategy } from './BaseQuickReferenceStrategy.js';
import { PtuQuickReferenceInfo } from '../../../options/subcommand-groups/ptu/index.js';

@staticImplements<ChatIteractionStrategy>()
export class QrPokemonExperienceChartStrategy
{
    public static key = PtuQuickReferenceInfo.PokemonExperienceChart;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        return await BaseQuickReferenceStrategy.run(interaction, this.key);
    }
}
