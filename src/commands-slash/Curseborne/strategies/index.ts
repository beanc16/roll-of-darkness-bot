import { logger } from '@beanc16/logger';
import type {
    ApplicationCommandOptionChoiceData,
    AutocompleteFocusedOption,
    ChatInputCommandInteraction,
} from 'discord.js';

import { MAX_AUTOCOMPLETE_CHOICES } from '../../../constants/discord.js';
import { BaseGetLookupSearchMatchType, BaseLookupStrategy } from '../../strategies/BaseLookupStrategy.js';
import { BaseStrategyExecutor } from '../../strategies/BaseStrategyExecutor.js';
import { StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
import { AutocompleteHandlerMap } from '../../strategies/types/types.js';
import {
    CurseborneAllNestedSubcommands,
    CurseborneSubcommand,
    CurseborneSubcommandGroup,
} from '../options/index.js';
import { CurseborneLookupSubcommand } from '../options/lookup.js';
import { CurseborneSpell } from '../types/CurseborneSpell.js';
import { CurseborneAutocompleteParameterName } from '../types/types.js';
import { GetLookupEdgeDataParameters, LookupEdgeStrategy } from './lookup/LookupEdgeStrategy.js';
import { GetLookupSpellDataParameters, LookupSpellStrategy } from './lookup/LookupSpellStrategy.js';
import { GetLookupTrickDataParameters, LookupTrickStrategy } from './lookup/LookupTrickStrategy.js';
import { RollStrategy } from './RollStrategy.js';

interface CursebourneStrategyExecutorRunParameters
{
    subcommandGroup?: CurseborneSubcommandGroup;
    subcommand: CurseborneSubcommand | CurseborneAllNestedSubcommands;
    interaction: ChatInputCommandInteraction;
}

type AllLookupParams = GetLookupEdgeDataParameters
    | GetLookupSpellDataParameters
    | GetLookupTrickDataParameters;

type CurseborneStrategyMap = StrategyMap<
    CurseborneSubcommandGroup,
    CurseborneSubcommand | CurseborneLookupSubcommand
>;

export class CurseborneStrategyExecutor extends BaseStrategyExecutor
{
    protected static strategies: CurseborneStrategyMap = {
        [CurseborneSubcommandGroup.Lookup]: {
            [LookupEdgeStrategy.key]: LookupEdgeStrategy,
            [LookupSpellStrategy.key]: LookupSpellStrategy,
            [LookupTrickStrategy.key]: LookupTrickStrategy,
        },
        [RollStrategy.key]: RollStrategy,
    };

    /* istanbul ignore next */
    public static async run({
        subcommandGroup,
        subcommand,
        interaction,
    }: CursebourneStrategyExecutorRunParameters): Promise<boolean>
    {
        const Strategy = this.getStrategy({
            strategies: this.strategies,
            subcommandGroup,
            subcommand,
        });

        if (Strategy)
        {
            return await Strategy.run(interaction);
        }

        return false;
    }

    public static async getAutocompleteChoices(focusedValue: AutocompleteFocusedOption): Promise<ApplicationCommandOptionChoiceData<string>[]>
    {
        const autocompleteName = focusedValue.name as CurseborneAutocompleteParameterName;

        // Get data based on the autocompleteName
        const handlerMap: AutocompleteHandlerMap<CurseborneAutocompleteParameterName> = {
            [CurseborneAutocompleteParameterName.EdgeName]: () => CurseborneStrategyExecutor.getLookupData({
                subcommandGroup: CurseborneSubcommandGroup.Lookup,
                subcommand: CurseborneLookupSubcommand.Edge,
                lookupParams: {
                    ...(focusedValue.value.length > 0 ? { name: focusedValue.value } : {}),
                    options: {
                        matchType: BaseGetLookupSearchMatchType.SubstringMatch,
                    },
                },
            }),
            [CurseborneAutocompleteParameterName.SpellName]: () => CurseborneStrategyExecutor.getLookupData({
                subcommandGroup: CurseborneSubcommandGroup.Lookup,
                subcommand: CurseborneLookupSubcommand.Spell,
                lookupParams: {
                    ...(focusedValue.value.length > 0 ? { name: focusedValue.value } : {}),
                    options: {
                        matchType: BaseGetLookupSearchMatchType.SubstringMatch,
                    },
                },
            }),
            [CurseborneAutocompleteParameterName.SpellAvailableTo]: async () =>
            {
                const data = await CurseborneStrategyExecutor.getLookupData<CurseborneSpell>({
                    subcommandGroup: CurseborneSubcommandGroup.Lookup,
                    subcommand: CurseborneLookupSubcommand.Spell,
                    lookupParams: {
                        ...(focusedValue.value.length > 0 ? { name: focusedValue.value } : {}),
                        options: {
                            matchType: BaseGetLookupSearchMatchType.SubstringMatch,
                        },
                    },
                });

                // Set unique values
                const set = data.reduce<Set<string>>((acc, { availableTo = [] }) =>
                {
                    availableTo.forEach(element => acc.add(element));
                    return acc;
                }, new Set());

                // Convert to the desired output
                const output: { name: string }[] = [];
                set.forEach(element => output.push({ name: element }));
                output.sort((a, b) => a.name.localeCompare(b.name));
                return output;
            },
            [CurseborneAutocompleteParameterName.TrickName]: () => CurseborneStrategyExecutor.getLookupData({
                subcommandGroup: CurseborneSubcommandGroup.Lookup,
                subcommand: CurseborneLookupSubcommand.Trick,
                lookupParams: {
                    ...(focusedValue.value.length > 0 ? { name: focusedValue.value } : {}),
                    options: {
                        matchType: BaseGetLookupSearchMatchType.SubstringMatch,
                    },
                },
            }),
        };

        const data = await handlerMap[autocompleteName]();

        // Handle enums not being set properly
        if (!data)
        {
            logger.error(`Failed to get autocomplete data. Ensure that all enums and handlers are set up as intended in ${this.name}`, { autocompleteName });
            return [];
        }

        // Parse data to discord's format
        const choices = data.map<ApplicationCommandOptionChoiceData<string>>(({ name }) =>
        {
            return {
                name,
                value: name,
            };
        });

        // Get the choices matching the search
        const filteredChoices = choices.filter(choice =>
            choice.name.toLowerCase().startsWith(focusedValue.value.toLowerCase(), 0),
        );

        // Discord limits a maximum of 25 choices to display
        return filteredChoices.slice(0, MAX_AUTOCOMPLETE_CHOICES);
    }

    /* istanbul ignore next */
    public static async getLookupData<ClassInstance extends { name: string }>({
        subcommandGroup,
        subcommand,
        lookupParams,
    }: Pick<CursebourneStrategyExecutorRunParameters, 'subcommandGroup' | 'subcommand'> & { lookupParams: AllLookupParams }): Promise<ClassInstance[]>
    {
        const Strategy = this.getStrategy({
            strategies: this.strategies,
            subcommandGroup,
            subcommand,
        }) as BaseLookupStrategy<AllLookupParams, ClassInstance>;

        if (Strategy)
        {
            return await Strategy.getLookupData(lookupParams);
        }

        return [];
    }
}
