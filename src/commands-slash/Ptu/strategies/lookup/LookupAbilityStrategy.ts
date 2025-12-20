import { Text } from '@beanc16/discordjs-helpers';
import { logger } from '@beanc16/logger';
import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../shared/embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { OnRowAbovePaginationButtonPressResponse } from '../../../strategies/PaginationStrategy/PaginationStrategy.js';
import { LookupAbilityActionRowBuilder, LookupAbilityCustomId } from '../../components/lookup/LookupAbilityActionRowBuilder.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuAbility } from '../../models/PtuAbility.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAbilitiesSearchService } from '../../services/PtuAbilitiesSearchService.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import { GetLookupAbilityDataParameters } from '../../types/modelParameters.js';
import { PtuLookupIteractionStrategy, PtuStrategyMap } from '../../types/strategies.js';

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupAbilityStrategy
{
    public static key: PtuLookupSubcommand.Ability = PtuLookupSubcommand.Ability;

    public static async run(interaction: ChatInputCommandInteraction, strategies: PtuStrategyMap, options?: never): Promise<boolean>;
    public static async run(interaction: ButtonInteraction, strategies: PtuStrategyMap, options?: Partial<GetLookupAbilityDataParameters>): Promise<boolean>;
    public static async run(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        strategies: PtuStrategyMap,
        inputOptions?: Partial<GetLookupAbilityDataParameters>,
    ): Promise<boolean>
    {
        // Get parameter results
        const options = this.getOptions(interaction as ButtonInteraction, inputOptions);

        // Get data
        const data = await this.getLookupData(options);

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Abilities',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.frequency !== undefined
                    ? [`Frequency: ${element.frequency}`]
                    : []
                ),
                ...(element.basedOn !== undefined
                    ? [`Based On: ${element.basedOn}`]
                    : []
                ),
                ...(element.effect2 && element.effect2 !== '--'
                    ? [`Effect:\n\`\`\`\n${element.effect2}\`\`\``]
                    : ['']
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Ability}`,
            noEmbedsErrorMessage: 'No abilities were found.',
            ...(data.length === 1
                ? {
                    rowsAbovePagination: [
                        new LookupAbilityActionRowBuilder(),
                    ],
                    onRowAbovePaginationButtonPress: async (buttonInteraction) =>
                        await this.handleButtons(buttonInteraction as ButtonInteraction, strategies, data[0].name),
                }
                : {}
            ),
        });
    }

    public static async getLookupData(input: GetLookupAbilityDataParameters = {}): Promise<PtuAbility[]>
    {
        try
        {
            const { data = [] } = await CachedGoogleSheetsApiService.getRange({
                spreadsheetId: rollOfDarknessPtuSpreadsheetId,
                range: PtuLookupRange.Ability,
            });

            let output = data.reduce<PtuAbility[]>((acc, cur) =>
            {
                const element = new PtuAbility(cur);

                if (!element.IsValidBasedOnInput(input))
                {
                    return acc;
                }

                acc.push(element);

                return acc;
            }, []);

            // Sort manually if there's no searches
            if (input.nameSearch || input.effectSearch)
            {
                const results = PtuAbilitiesSearchService.search(output, input);
                const resultNames = new Set(results.map((element) => element.name.toLowerCase()));
                const manualResults = output.filter((element) =>
                {
                    // Only add items not already in the list
                    if (resultNames.has(element.name.toLowerCase()))
                    {
                        return false;
                    }

                    if (input.nameSearch && element.name.toLowerCase().includes(input.nameSearch.toLowerCase()))
                    {
                        return true;
                    }

                    if (input.effectSearch && element.effect2?.toLowerCase()?.includes(input.effectSearch.toLowerCase()))
                    {
                        return true;
                    }

                    return false;
                });

                output = [
                    ...manualResults,
                    ...results,
                ];
            }

            output.sort((a, b) => a.name.localeCompare(b.name));
            return output;
        }

        catch (error)
        {
            logger.error('Failed to retrieve ptu abilities', error);
            return [];
        }
    }

    private static async handleButtons(
        buttonInteraction: ButtonInteraction,
        strategies: PtuStrategyMap,
        abilityName: string,
    ): Promise<Pick<OnRowAbovePaginationButtonPressResponse, 'shouldUpdateMessage'>>
    {
        const handlerMap: Record<LookupAbilityCustomId, () => Promise<boolean | undefined>> = {
            [LookupAbilityCustomId.LookupPokemon]: async () => await strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Pokemon]?.run(buttonInteraction, strategies, {
                abilityName,
            }),
        };

        await buttonInteraction.deferReply({ fetchReply: true });
        await handlerMap[buttonInteraction.customId as LookupAbilityCustomId]();

        return { shouldUpdateMessage: false };
    }

    private static getOptions(interaction: ChatInputCommandInteraction, options?: never): GetLookupAbilityDataParameters;
    private static getOptions(interaction: ButtonInteraction, options?: Partial<GetLookupAbilityDataParameters>): GetLookupAbilityDataParameters;
    private static getOptions(
        untypedInteraction: ChatInputCommandInteraction | ButtonInteraction,
        options?: Partial<GetLookupAbilityDataParameters>,
    ): GetLookupAbilityDataParameters
    {
        if (options)
        {
            return {
                ...options,
            };
        }

        const interaction = untypedInteraction as ChatInputCommandInteraction;

        const name = interaction.options.getString(PtuAutocompleteParameterName.AbilityName);
        const nameSearch = interaction.options.getString('name_search');
        const frequencySearch = interaction.options.getString('frequency_search');
        const effectSearch = interaction.options.getString('effect_search');
        const basedOn = interaction.options.getString(PtuAutocompleteParameterName.BasedOnAbility);

        return {
            name,
            nameSearch,
            frequencySearch,
            effectSearch,
            basedOn,
        };
    }
}
