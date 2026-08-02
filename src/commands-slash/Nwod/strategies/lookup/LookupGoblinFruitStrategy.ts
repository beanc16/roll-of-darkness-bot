import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../shared/embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessNwodSpreadsheetId } from '../../constants.js';
import { NwodSubcommandGroup } from '../../options/index.js';
import { NwodLookupSubcommand } from '../../options/lookup.js';
import { ChangelingGoblinFruit } from '../../types/ChangelingGoblinFruit.js';
import { NwodAutocompleteParameterName, NwodLookupRange } from '../../types/lookup.js';
import { ChangelingGoblinFruitRarity } from '../../types/types.js';

export interface GetLookupGoblinFruitDataOptions extends BaseLookupDataOptions
{
    name?: string | null;
    rarity?: ChangelingGoblinFruitRarity | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupGoblinFruitStrategy
{
    public static key = NwodLookupSubcommand.GoblinFruit;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(NwodAutocompleteParameterName.GoblinFruitName);
        const rarity = interaction.options.getString('rarity') as ChangelingGoblinFruitRarity | null;

        const data = await this.getLookupData({
            name,
            rarity,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Goblin Fruits',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.rarity !== undefined
                    ? [`Rarity: ${element.rarity}`]
                    : []
                ),
                ...(element.pageNumber !== undefined
                    ? [`Page Number: ${element.pageNumber}`]
                    : []
                ),
                ...(element.effect !== undefined
                    ? [
                        `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/nwod ${NwodSubcommandGroup.Lookup} ${NwodLookupSubcommand.GoblinFruit}`,
            noEmbedsErrorMessage: 'No goblin fruits were found.',
        });
    }

    public static async getLookupData(input: GetLookupGoblinFruitDataOptions = {
        includeAllIfNoName: true,
    }): Promise<ChangelingGoblinFruit[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessNwodSpreadsheetId,
            range: NwodLookupRange.GoblinFruit,
        });

        const output = data.reduce<ChangelingGoblinFruit[]>((acc, cur) =>
        {
            // Ignore empty rows
            if (cur[0] === undefined || cur[0].trim() === '')
            {
                return acc;
            }

            const element = new ChangelingGoblinFruit(cur);

            // Name
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Rarity
            if (input.rarity && input.rarity.toLowerCase() !== element.rarity.toLowerCase())
            {
                return acc;
            }

            acc.push(element);
            return acc;
        }, []);

        // Sort by name
        output.sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        return output;
    }
}
