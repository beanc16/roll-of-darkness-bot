import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { BerryTier, PtuRandomSubcommand } from '../../../options/subcommand-groups/ptu/random.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { RandomResult } from '../../../Ptu.js';

@staticImplements<ChatIteractionStrategy>()
export class RandomBerryStrategy
{
    public static key = PtuRandomSubcommand.Berry;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const inputTier = interaction.options.getString('berry_tier') || BerryTier.OnePlus;

        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            // TODO: Make this spreadsheet id a constant later
            spreadsheetId: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI',
            range: `'${BaseRandomStrategy.subcommandToStrings[this.key].data} Data'!A2:D`,
        });

        const shouldInclude = ({ inputTier, tier }: { inputTier: string, tier: number }) =>
        {
            if (inputTier === BerryTier.OnePlus && tier >= 1) return true;
            if (inputTier === BerryTier.One && tier === 1) return true;
            if (inputTier === BerryTier.TwoPlus && tier >= 2) return true;
            if (inputTier === BerryTier.Two && tier === 2) return true;
            if (inputTier === BerryTier.Three && tier === 3) return true;
            return false;
        };

        // Parse the data
        const parsedData = data.reduce<RandomResult[]>((acc, [name, cost, unparsedTier, description]) => {
            const tier = parseInt(unparsedTier, 10);

            if (shouldInclude({ inputTier, tier }))
            {
                acc.push({
                    name,
                    cost,
                    description,
                });
            }

            return acc;
        }, []);

        return await BaseRandomStrategy.run(interaction, this.key, {
            parsedData,
        });
    }
}
