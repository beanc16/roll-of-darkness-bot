import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { BaseQuickReferenceStrategy } from './BaseQuickReferenceStrategy.js';
import { PtuQuickReferenceSubcommand } from '../../../options/subcommand-groups/ptu/quickReference.js';

@staticImplements<ChatIteractionStrategy>()
export class QrSwitchingPokemonStrategy
{
    public static key = PtuQuickReferenceSubcommand.SwitchingPokemon;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        return await BaseQuickReferenceStrategy.run(interaction, this.key);
    }
}
