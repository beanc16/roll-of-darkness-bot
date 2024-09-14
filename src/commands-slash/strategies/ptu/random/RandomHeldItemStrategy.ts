import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuRandomSubcommand } from '../../../options/subcommand-groups/ptu/random.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { RandomResult } from '../../../Ptu.js';

enum HeldItemTypes
{
    Normal = 'Normal',
    Mega = 'Mega',
}

@staticImplements<ChatIteractionStrategy>()
export class RandomHeldItemStrategy
{
    public static key = PtuRandomSubcommand.HeldItem;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const includeMega = interaction.options.getBoolean('include_mega') || false;

        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            // TODO: Make this spreadsheet id a constant later
            spreadsheetId: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI',
            range: `'${BaseRandomStrategy.subcommandToStrings[this.key].data} Data'!A2:D`,
        });

        const shouldInclude = ({ type, includeMega }: { type: string, includeMega: boolean }) =>
        {
            return (
                type === HeldItemTypes.Normal
                || (type === HeldItemTypes.Mega && includeMega)
            );
        };

        // Parse the data
        const parsedData = data.reduce<RandomResult[]>((acc, [name, cost, type, description]) => {
            if (shouldInclude({ type, includeMega }))
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
