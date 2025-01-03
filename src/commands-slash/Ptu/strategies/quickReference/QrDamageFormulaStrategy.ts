import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { PtuQuickReferenceInfo } from '../../options/index.js';
import { BaseQuickReferenceStrategy } from './BaseQuickReferenceStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class QrDamageFormulaStrategy
{
    public static key: PtuQuickReferenceInfo.DamageFormula = PtuQuickReferenceInfo.DamageFormula;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        return await BaseQuickReferenceStrategy.run(interaction, this.key);
    }
}
