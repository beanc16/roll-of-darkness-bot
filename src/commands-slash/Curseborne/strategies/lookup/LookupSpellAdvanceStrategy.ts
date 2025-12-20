import { Text } from '@beanc16/discordjs-helpers';
import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { getPagedEmbedMessages } from '../../../shared/embed-messages/shared.js';
import {
    BaseGetLookupDataParams,
    BaseGetLookupSearchMatchType,
    LookupStrategy,
} from '../../../strategies/BaseLookupStrategy.js';
import { OnRowAbovePaginationButtonPressResponse } from '../../../strategies/PaginationStrategy/PaginationStrategy.js';
import { rollOfDarknessCurseborneSpreadsheetId } from '../../constants.js';
import { CurseborneSubcommandGroup } from '../../options/index.js';
import { CurseborneLookupSubcommand } from '../../options/lookup.js';
import { CurseborneSpellAdvance } from '../../types/CurseborneSpellAdvance.js';
import { CurseborneLookupIteractionStrategy, CurseborneStrategyMap } from '../../types/strategies.js';
import { CurseborneAutocompleteParameterName } from '../../types/types.js';
import { BaseCurseborneLookupStrategy } from './BaseCurseborneLookupStrategy.js';
import { LookupSpellAdvanceActionRowBuilder, LookupSpellAdvanceCustomId } from './components/LookupSpellAdvanceActionRowBuilder.js';

export interface GetLookupSpellAdvanceDataParameters extends BaseGetLookupDataParams
{
    names?: string[] | null;
    spellName?: string | null;
}

@staticImplements<CurseborneLookupIteractionStrategy>()
export class LookupSpellAdvanceStrategy extends BaseCurseborneLookupStrategy
{
    public static key: CurseborneLookupSubcommand.SpellAdvance = CurseborneLookupSubcommand.SpellAdvance;

    public static async run(interaction: ChatInputCommandInteraction, strategies: CurseborneStrategyMap, options?: never): Promise<boolean>;
    public static async run(interaction: ButtonInteraction, strategies: CurseborneStrategyMap, options?: Partial<GetLookupSpellAdvanceDataParameters>): Promise<boolean>;
    public static async run(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        strategies: CurseborneStrategyMap,
        inputOptions?: Partial<GetLookupSpellAdvanceDataParameters>,
    ): Promise<boolean>
    {
        // Get parameter results
        const { names, spellName } = this.getOptions(interaction as ButtonInteraction, inputOptions);

        // Get data
        const data = await this.getLookupData({
            names,
            spellName,
            options: {
                matchType: BaseGetLookupSearchMatchType.ExactMatch,
            },
        });

        const prerequisiteSpells = new Set(
            data.map(element => element.prerequisites[0]),
        );

        // Send message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Spell Advances',
            parseElementToLines: (element) => [
                Text.bold(element.name),
                ...(element.prerequisites !== undefined
                    ? [[
                        element.prerequisites.length > 1 ? 'Prerequisites' : 'Prerequisite',
                        element.prerequisites.join(', '),
                    ].join(': ')]
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
            commandName: `/cb ${CurseborneSubcommandGroup.Lookup} ${this.key}`,
            noEmbedsErrorMessage: `No spell advances were found.`,
            ...(prerequisiteSpells.size === 1
                ? {
                    rowsAbovePagination: [
                        new LookupSpellAdvanceActionRowBuilder(),
                    ],
                    onRowAbovePaginationButtonPress: async (buttonInteraction) =>
                        await this.handleButtons(buttonInteraction as ButtonInteraction, strategies, data[0].name),
                }
                : {}
            ),
        });
    }

    public static async getLookupData(input: GetLookupSpellAdvanceDataParameters): Promise<CurseborneSpellAdvance[]>
    {
        const numOfDefinedLookupProperties = this.getNumOfDefinedLookupProperties(input);

        return await LookupStrategy.getLookupData({
            Class: CurseborneSpellAdvance,
            range: `'Spell Advance Index'!A3:Z`,
            spreadsheetId: rollOfDarknessCurseborneSpreadsheetId,
            reduceCallback: (acc, cur) =>
            {
                const element = new CurseborneSpellAdvance(cur);

                if (
                    numOfDefinedLookupProperties === 0
                    || this.hasArrayMatch(input, {
                        inputValue: input.names,
                        elementValue: element.name,
                    })
                    || this.hasArrayMatch(input, {
                        inputValue: input.spellName,
                        elementValue: element.prerequisites,
                    })
                )
                {
                    acc.push(element);
                }

                return acc;
            },
        });
    }

    private static getOptions(interaction: ChatInputCommandInteraction, options?: never): GetLookupSpellAdvanceDataParameters;
    private static getOptions(interaction: ButtonInteraction, options?: Partial<GetLookupSpellAdvanceDataParameters>): GetLookupSpellAdvanceDataParameters;
    private static getOptions(
        untypedInteraction: ChatInputCommandInteraction | ButtonInteraction,
        options?: Partial<GetLookupSpellAdvanceDataParameters>,
    ): GetLookupSpellAdvanceDataParameters
    {
        const defaultLookupOptions: GetLookupSpellAdvanceDataParameters['options'] = {
            matchType: BaseGetLookupSearchMatchType.SubstringMatch,
        };

        if (options)
        {
            return {
                ...options,
                options: {
                    ...defaultLookupOptions,
                    ...(options.options || {}),
                },
            };
        }

        const interaction = untypedInteraction as ChatInputCommandInteraction;

        const name = interaction.options.getString(CurseborneAutocompleteParameterName.SpellAdvanceName);
        const spellName = interaction.options.getString(CurseborneAutocompleteParameterName.SpellName);

        return {
            names: name ? [name] : null,
            spellName,
            options: defaultLookupOptions,
        };
    }

    private static async handleButtons(
        buttonInteraction: ButtonInteraction,
        strategies: CurseborneStrategyMap,
        advanceName: string,
    ): Promise<Pick<OnRowAbovePaginationButtonPressResponse, 'shouldUpdateMessage'>>
    {
        const handlerMap: Record<LookupSpellAdvanceCustomId, () => Promise<boolean | undefined>> = {
            [LookupSpellAdvanceCustomId.LookupSpells]: async () => await strategies[CurseborneSubcommandGroup.Lookup][CurseborneLookupSubcommand.Spell]?.run(buttonInteraction, strategies, {
                advanceName,
            }),
        };

        await buttonInteraction.deferReply({ fetchReply: true });
        await handlerMap[buttonInteraction.customId as LookupSpellAdvanceCustomId]();

        return { shouldUpdateMessage: false };
    }
}
