import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuRandomSubcommand } from '../../subcommand-groups/random.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { RandomResult } from '../../../Ptu.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuRandomPickupSubcommandResponse, PtuRandomPickupSubcommandStrategy } from './types.js';

enum HeldItemTypes
{
    Normal = 'Normal',
    Mega = 'Mega',
}

@staticImplements<PtuRandomPickupSubcommandStrategy>()
export class RandomHeldItemStrategy
{
    public static key = PtuRandomSubcommand.HeldItem;

    public static async run(
        interaction: ChatInputCommandInteraction,
        shouldReturnMessageOptions = false
    ): Promise<boolean | PtuRandomPickupSubcommandResponse>
    {
        // Get parameter results
        const includeMega = interaction.options.getBoolean('include_mega') || false;

        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
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
            commandName: `ptu random ${this.key}`,
            parsedData,
        }, undefined, shouldReturnMessageOptions);
    }
}
