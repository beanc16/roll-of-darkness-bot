import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { getLookupNatureEmbedMessages } from '../../embed-messages/lookup.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';
import { PtuNature } from '../../types/PtuNature.js';

export interface GetLookupNatureDataParameters
{
    name?: string | null;
    raisedStat?: string | null;
    loweredStat?: string | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupNatureStrategy
{
    public static key = PtuLookupSubcommand.Nature;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString('nature_name');
        const raisedStat = interaction.options.getString('raised_stat');
        const loweredStat = interaction.options.getString('lowered_stat');

        // Validate input parameters
        if (
            (name && raisedStat)
            || (name && loweredStat)
        )
        {
            await interaction.editReply('Cannot look up a nature by both name and stats at the same time.');
            return true;
        }

        const natures = await this.getLookupData({
            name,
            raisedStat,
            loweredStat,
        });

        // Get message
        const embeds = getLookupNatureEmbedMessages(natures);

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No natures were found.',
        });
    }

    private static async getLookupData(input: GetLookupNatureDataParameters = {}): Promise<PtuNature[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'Nature Data'!A2:E`,
        });

        const natures = data.reduce<PtuNature[]>((acc, cur) =>
        {
            const nature = new PtuNature(cur);

            if (input.name && input.name.toLowerCase() !== nature.name.toLowerCase())
            {
                return acc;
            }

            if (input.raisedStat && input.raisedStat !== nature.raisedStat)
            {
                return acc;
            }

            if (input.loweredStat && input.loweredStat !== nature.loweredStat)
            {
                return acc;
            }

            acc.push(nature);
            return acc;
        }, []);

        return natures;
    }
}
