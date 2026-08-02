import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuQuickReferenceInfo } from '../../options/index.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';
import { BaseQuickReferenceStrategy } from './BaseQuickReferenceStrategy.js';

@staticImplements<PtuChatIteractionStrategy>()
export class QrDispositionChartStrategy
{
    public static key: PtuQuickReferenceInfo.Disposition = PtuQuickReferenceInfo.Disposition;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        return await BaseQuickReferenceStrategy.run(interaction, this.key);
    }
}
