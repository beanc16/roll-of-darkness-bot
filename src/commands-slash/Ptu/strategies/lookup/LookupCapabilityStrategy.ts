import { Text } from '@beanc16/discordjs-helpers';
import type { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../shared/embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import type { OnRowAbovePaginationButtonPressResponse } from '../../../strategies/PaginationStrategy/PaginationStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { LookupCapabilityActionRowBuilder, LookupCapabilityCustomId } from '../../components/lookup/LookupCapabilityActionRowBuilder.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { PtuCapability } from '../../types/PtuCapability.js';
import type { PtuLookupIteractionStrategy, PtuStrategyMap } from '../../types/strategies.js';

export interface GetLookupCapabilityDataParameters extends BaseLookupDataOptions
{
    name?: string | null;
}

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupCapabilityStrategy
{
    public static key: PtuLookupSubcommand.Capability = PtuLookupSubcommand.Capability;

    public static async run(interaction: ChatInputCommandInteraction, strategies: PtuStrategyMap, options?: never): Promise<boolean>;
    public static async run(interaction: ButtonInteraction, strategies: PtuStrategyMap, options?: Partial<GetLookupCapabilityDataParameters>): Promise<boolean>;
    public static async run(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        strategies: PtuStrategyMap,
        inputOptions?: Partial<GetLookupCapabilityDataParameters>,
    ): Promise<boolean>
    {
        // Get parameter results
        const options = this.getOptions(interaction as ButtonInteraction, inputOptions);

        // Get data
        const data = await this.getLookupData(options);

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Capabilities',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.description !== undefined && element.description !== '--'
                    ? [
                        `Description:\n\`\`\`\n${element.description}\`\`\``,
                    ]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Capability}`,
            noEmbedsErrorMessage: 'No capabilities were found.',
            ...(data.length === 1
                ? {
                    rowsAbovePagination: [
                        new LookupCapabilityActionRowBuilder(),
                    ],
                    onRowAbovePaginationButtonPress: async (buttonInteraction) =>
                        await this.handleButtons(buttonInteraction as ButtonInteraction, strategies, data[0].name),
                }
                : {}
            ),
        });
    }

    public static async getLookupData(input: GetLookupCapabilityDataParameters = {
        includeAllIfNoName: true,
    }): Promise<PtuCapability[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Capability,
        });

        const output = data.reduce<PtuCapability[]>((acc, cur) =>
        {
            const element = new PtuCapability(cur);

            // cur[0] === name in spreadsheet
            if (!(input.name && input.name.toLowerCase() === element.name.toLowerCase()) && !input.includeAllIfNoName)
            {
                return acc;
            }

            acc.push(element);
            return acc;
        }, []);

        // Sort by name
        output.sort((a, b) => a.name.localeCompare(b.name));

        return output;
    }

    private static async handleButtons(
        buttonInteraction: ButtonInteraction,
        strategies: PtuStrategyMap,
        capabilityName: string,
    ): Promise<Pick<OnRowAbovePaginationButtonPressResponse, 'shouldUpdateMessage'>>
    {
        const handlerMap: Record<LookupCapabilityCustomId, () => Promise<boolean | undefined>> = {
            [LookupCapabilityCustomId.LookupPokemon]: async () => await strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Pokemon]?.run(buttonInteraction, strategies, {
                capabilityName,
            }),
        };

        await buttonInteraction.deferReply({ fetchReply: true });
        await handlerMap[buttonInteraction.customId as LookupCapabilityCustomId]();

        return { shouldUpdateMessage: false };
    }

    private static getOptions(interaction: ChatInputCommandInteraction, options?: never): GetLookupCapabilityDataParameters;
    private static getOptions(interaction: ButtonInteraction, options?: Partial<GetLookupCapabilityDataParameters>): GetLookupCapabilityDataParameters;
    private static getOptions(
        untypedInteraction: ChatInputCommandInteraction | ButtonInteraction,
        options?: Partial<GetLookupCapabilityDataParameters>,
    ): GetLookupCapabilityDataParameters
    {
        if (options)
        {
            return {
                ...options,
            };
        }

        const interaction = untypedInteraction as ChatInputCommandInteraction;

        const name = interaction.options.getString(PtuAutocompleteParameterName.CapabilityName);

        return {
            name,
            includeAllIfNoName: !name,
        };
    }
}
