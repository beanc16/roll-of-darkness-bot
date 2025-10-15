import { Text } from '@beanc16/discordjs-helpers';
import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import {
    BaseGetLookupDataParams,
    BaseGetLookupSearchMatchType,
    LookupStrategy,
} from '../../../strategies/BaseLookupStrategy.js';
import { OnRowAbovePaginationButtonPressResponse } from '../../../strategies/PaginationStrategy/PaginationStrategy.js';
import { rollOfDarknessCurseborneSpreadsheetId } from '../../constants.js';
import { CurseborneSubcommandGroup } from '../../options/index.js';
import { CurseborneLookupSubcommand } from '../../options/lookup.js';
import { CurseborneSpell } from '../../types/CurseborneSpell.js';
import { CurseborneLookupIteractionStrategy, CurseborneStrategyMap } from '../../types/strategies.js';
import { CurseborneAutocompleteParameterName } from '../../types/types.js';
import { BaseCurseborneLookupStrategy } from './BaseCurseborneLookupStrategy.js';
import { LookupSpellActionRowBuilder, LookupSpellCustomId } from './components/LookupSpellActionRowBuilder.js';

export interface GetLookupSpellDataParameters extends BaseGetLookupDataParams
{
    name?: string | null;
    spellAvailableTo?: string | null;
    type?: string | null;
    attunement?: string | null;
    advanceName?: string | null;
}

@staticImplements<CurseborneLookupIteractionStrategy>()
export class LookupSpellStrategy extends BaseCurseborneLookupStrategy
{
    public static key: CurseborneLookupSubcommand.Spell = CurseborneLookupSubcommand.Spell;

    public static async run(interaction: ChatInputCommandInteraction, strategies: CurseborneStrategyMap, options?: never): Promise<boolean>;
    public static async run(interaction: ButtonInteraction, strategies: CurseborneStrategyMap, options?: Partial<GetLookupSpellDataParameters>): Promise<boolean>;
    public static async run(
        interaction: ChatInputCommandInteraction | ButtonInteraction,
        strategies: CurseborneStrategyMap,
        inputOptions?: Partial<GetLookupSpellDataParameters>,
    ): Promise<boolean>
    {
        // Get parameter results
        const {
            name,
            spellAvailableTo,
            type,
            attunement,
            advanceName,
        } = this.getOptions(interaction as ButtonInteraction, inputOptions);

        // Get data
        const data = await this.getLookupData({
            name,
            spellAvailableTo,
            type,
            attunement,
            advanceName,
            options: {
                // Do a substring match if an advance name is provided
                // (it'll only be the name without the Entanglement level)
                matchType: advanceName
                    ? BaseGetLookupSearchMatchType.SubstringMatch
                    : BaseGetLookupSearchMatchType.ExactMatch,
            },
        });

        // Send message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Spells',
            parseElementToLines: (element) => [
                Text.bold(element.name),
                ...(element.availableTo !== undefined
                    ? [[
                        'Available To',
                        element.availableTo.join(', '),
                    ].join(': ')]
                    : []
                ),
                ...(element.cost !== undefined
                    ? [`Cost: ${element.cost}`]
                    : []
                ),
                ...(element.types !== undefined
                    ? [[
                        element.types.length > 1 ? 'Types' : 'Type',
                        element.types.join(', '),
                    ].join(': ')]
                    : []
                ),
                ...(element.attunements !== undefined
                    ? [[
                        element.attunements.length > 1 ? 'Attunements' : 'Attunement',
                        element.attunements.join(', '),
                    ].join(': ')]
                    : []
                ),
                ...(element.effect !== undefined
                    ? [
                        `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                    ]
                    : []
                ),
                ...(element.advanceNames !== undefined
                    ? [[
                        element.advanceNames.length > 1 ? 'Advance Names' : 'Advance Name',
                        Text.Code.multiLine(`${element.advanceNames.join('\n')}`),
                    ].join(': ')]
                    : []
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/cb ${CurseborneSubcommandGroup.Lookup} ${this.key}`,
            noEmbedsErrorMessage: `No spells were found.`,
            ...(data.length === 1
                ? {
                    rowsAbovePagination: [
                        new LookupSpellActionRowBuilder(),
                    ],
                    onRowAbovePaginationButtonPress: async (buttonInteraction) =>
                        await this.handleButtons(buttonInteraction as ButtonInteraction, strategies, data[0].advanceNames),
                }
                : {}
            ),
        });
    }

    public static async getLookupData(input: GetLookupSpellDataParameters): Promise<CurseborneSpell[]>
    {
        const numOfDefinedLookupProperties = this.getNumOfDefinedLookupProperties(input);

        return await LookupStrategy.getLookupData({
            Class: CurseborneSpell,
            range: `'Spells Index'!A3:Z`,
            spreadsheetId: rollOfDarknessCurseborneSpreadsheetId,
            reduceCallback: (acc, cur) =>
            {
                const element = new CurseborneSpell(cur);

                if (
                    numOfDefinedLookupProperties === 0
                    || this.hasMatch(input, {
                        inputValue: input.name,
                        elementValue: element.name,
                    })
                    || this.hasArrayMatch(input, {
                        inputValue: input.spellAvailableTo,
                        elementValue: element.availableTo,
                    })
                    || this.hasArrayMatch(input, {
                        inputValue: input.type,
                        elementValue: element.types,
                    })
                    || this.hasArrayMatch(input, {
                        inputValue: input.attunement,
                        elementValue: element.attunements,
                    })
                    || this.hasArrayMatch(input, {
                        inputValue: input.advanceName,
                        elementValue: element.advanceNames,
                    })
                )
                {
                    acc.push(element);
                }

                return acc;
            },
        });
    }

    private static getOptions(interaction: ChatInputCommandInteraction, options?: never): GetLookupSpellDataParameters;
    private static getOptions(interaction: ButtonInteraction, options?: Partial<GetLookupSpellDataParameters>): GetLookupSpellDataParameters;
    private static getOptions(
        untypedInteraction: ChatInputCommandInteraction | ButtonInteraction,
        options?: Partial<GetLookupSpellDataParameters>,
    ): GetLookupSpellDataParameters
    {
        const defaultLookupOptions: GetLookupSpellDataParameters['options'] = {
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

        const name = interaction.options.getString(CurseborneAutocompleteParameterName.SpellName);
        const spellAvailableTo = interaction.options.getString(CurseborneAutocompleteParameterName.SpellAvailableTo);
        const type = interaction.options.getString(CurseborneAutocompleteParameterName.SpellType);
        const attunement = interaction.options.getString(CurseborneAutocompleteParameterName.SpellAttunement);

        return {
            name,
            spellAvailableTo,
            type,
            attunement,
            advanceName: null, // Only comes in on button interaction
            options: defaultLookupOptions,
        };
    }

    private static async handleButtons(
        buttonInteraction: ButtonInteraction,
        strategies: CurseborneStrategyMap,
        advanceNames: string[],
    ): Promise<Pick<OnRowAbovePaginationButtonPressResponse, 'shouldUpdateMessage'>>
    {
        const handlerMap: Record<LookupSpellCustomId, () => Promise<boolean | undefined>> = {
            [LookupSpellCustomId.LookupSpellAdvances]: async () => await strategies[CurseborneSubcommandGroup.Lookup][CurseborneLookupSubcommand.SpellAdvance]?.run(buttonInteraction, strategies, {
                // Get rid of the parentheses
                names: advanceNames.map(advanceName => advanceName.replace(/\(.+\)/, '').trim()),
            }),
        };

        await buttonInteraction.deferReply({ fetchReply: true });
        await handlerMap[buttonInteraction.customId as LookupSpellCustomId]();

        return { shouldUpdateMessage: false };
    }
}
