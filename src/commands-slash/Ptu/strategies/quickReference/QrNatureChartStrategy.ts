import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../../strategies/ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { BaseQuickReferenceStrategy } from './BaseQuickReferenceStrategy.js';
import { PtuQuickReferenceInfo } from '../../subcommand-groups/index.js';

@staticImplements<ChatIteractionStrategy>()
export class QrNatureChartStrategy
{
    public static key = PtuQuickReferenceInfo.NatureChart;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        return await BaseQuickReferenceStrategy.run(interaction, this.key);
    }
}
