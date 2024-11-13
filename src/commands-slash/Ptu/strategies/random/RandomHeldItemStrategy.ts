import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { RandomResult } from '../../../Ptu.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuRandomSubcommand } from '../../subcommand-groups/random.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { PtuRandomPickupSubcommandResponse, PtuRandomPickupSubcommandStrategy } from './types.js';

enum HeldItemTypes
{
    Normal = 'Normal',
    Mega = 'Mega',
    Badge = 'Badge',
}

@staticImplements<PtuRandomPickupSubcommandStrategy>()
export class RandomHeldItemStrategy
{
    public static key = PtuRandomSubcommand.HeldItem;

    public static async run(
        interaction: ChatInputCommandInteraction,
        shouldReturnMessageOptions = false,
    ): Promise<boolean | PtuRandomPickupSubcommandResponse>
    {
        // Get parameter results
        const includeMega = interaction.options.getBoolean('include_mega') || false;
        const includeBadges = interaction.options.getBoolean('include_badges') || false;

        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'${BaseRandomStrategy.subcommandToStrings[this.key].data} Data'!A2:D`,
        });

        const shouldInclude = ({
            type,
            includeMega,
            includeBadges,
        }: { type: string; includeMega: boolean; includeBadges: boolean }) =>
            (
                type === HeldItemTypes.Normal
                || (type === HeldItemTypes.Mega && includeMega)
                || (type === HeldItemTypes.Badge && includeBadges)
            );

        // Parse the data
        const parsedData = data.reduce<RandomResult[]>((acc, [name, cost, type, description]) =>
        {
            if (shouldInclude({ type, includeMega, includeBadges }))
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
            commandName: `ptu random ${this.key}`,
            parsedData,
        }, undefined, shouldReturnMessageOptions);
    }
}
