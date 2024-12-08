import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuLookupSubcommand } from '../../subcommand-groups/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
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
    public static key: PtuLookupSubcommand.Nature = PtuLookupSubcommand.Nature;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.NatureName);
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
        const embeds = getPagedEmbedMessages({
            input: natures,
            title: 'Natures',
            parseElementToLines: element => [
                Text.bold(element.name),
                `Raised: ${element.raisedStat}`,
                `Lowered: ${element.loweredStat}`,
                `Likes: ${element.likedFlavor}`,
                `Dislikes: ${element.dislikedFlavor}`,
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            noEmbedsErrorMessage: 'No natures were found.',
        });
    }

    private static async getLookupData(input: GetLookupNatureDataParameters = {}): Promise<PtuNature[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Nature,
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
