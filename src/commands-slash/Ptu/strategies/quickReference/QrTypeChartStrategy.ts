import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { PtuQuickReferenceInfo } from '../../subcommand-groups/index.js';
import { BaseQuickReferenceStrategy } from './BaseQuickReferenceStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class QrTypeChartStrategy
{
    public static key: PtuQuickReferenceInfo.TypeChart = PtuQuickReferenceInfo.TypeChart;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        return await BaseQuickReferenceStrategy.run(interaction, this.key);
    }
}
