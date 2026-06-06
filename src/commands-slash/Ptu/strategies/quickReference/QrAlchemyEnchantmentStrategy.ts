import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { getPagedEmbedBuilders } from '../../../shared/embed-messages/shared.js';
import { PtuQuickReferenceInfo } from '../../options/index.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';

@staticImplements<PtuChatIteractionStrategy>()
export class QrAlchemyEnchantmentStrategy
{
    public static key: PtuQuickReferenceInfo.AlchemyEnchantment = PtuQuickReferenceInfo.AlchemyEnchantment;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const lines = [
            '## How to Enchant Items with Alchemy',
            '',
            '### 1. Pick a Base',
            '- __Base__ - The thing you want magical properties on.',
            '- Examples: mundane equipment, weapons, clothing, armor, accessories, tools, etc.',
            '- Consumables, perishables, and living things typically don\'t work as bases.',
            '- You can change or empower a pre-existing enchantment on a magical item, but doing so is very challenging, and requires scare and expensive materials.',
            '',
            '### 2. Pick 1-3 Catalysts',
            '- __Catalysts__ - The things that define the magical properties of the soon-to-be magical item.',
            '- Usually defines a type alignment, but may define something else like being used for injuries, flinching, etc. instead.',
            '- Examples: elemental stone, keepsake, other common held item, or fossil.',
            '- Type plates act as a normal type alignment catalyst, but with a bonus.',
            '',
            '### 3. (Optional) Pick Extras',
            '- __Extras__ - Typically disposable or consumable items to give the item a magical quirk.',
            '- If extras are used, there\'s typically multiple. Three is the typical baseline.',
            '- Examples: berries, type gems, dream mist, cleanse tags, etc.',
            '',
            '### 4. Make Alchemy Rolls',
            '',
            'The ST determines the DC and tells the player how long the extended action roll will take. Then, the player makes an occult education check. The final item will either be:',
            '- *[Fail DC]:* Failed to be enchanted (likely damaging it by accident in the process).',
            '- *[Barely Miss DC]:* Successfully enchanted, but with a minor drawback (drawbacks are usually temporary for small/weak items, but persistent for moderate and large/strong items).',
            '- *[Hit DC]:* Successfully enchanted.',
            '',
            'If the DC is barely missed, another roll can be attempted to repair the item to a full success. However, failing this roll will break the item at best, or have other magical consequences at the worst.',
            '',
            '**Alchemical Labs**',
            'Alchemical Labs are where alchemists enchant magical items. They are a customized personal space of comfort and perceived power - akin to a 5 star chef\'s kitchen.',
            '- Items with 1 catalyst and 3 or less extras don\'t require a lab.',
            '- Items with 2 catalysts and/or more than 3 extras will have a challenging DC without a lab.',
            '- Items with 3 catalysts or 2 catalysts and 4+ extras always require a lab.',
            '',
            'Labs are almost always stationary, but can be taken down or set back up with about an hour of effort, with another week of getting re-acclimated afterwards.',
            '',
            'The contents of the lab are personalized, and thus vary from alchemist-to-alchemist. But, they typically contain some combination of collections of symbols, writings, tools, fetishes, and other mystical materials that the alchemist uses to record their learnings, expand their talent, and practice alchemy.',
        ];

        // Parse the text into embed messages
        const embeds = getPagedEmbedBuilders({
            title: 'Alchemy Enchantments',
            pages: [
                lines.join('\n'),
            ],
        });

        // Send the embed messages
        await interaction.editReply({
            embeds,
        });

        return true;
    }
}
