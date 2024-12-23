import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { PtuQuickReferenceInfo } from '../../options/index.js';
import { BaseQuickReferenceStrategy } from './BaseQuickReferenceStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class QrTrainingPokemonStrategy
{
    public static key: PtuQuickReferenceInfo.TrainingPokemon = PtuQuickReferenceInfo.TrainingPokemon;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        return await BaseQuickReferenceStrategy.run(interaction, this.key);
    }
}
