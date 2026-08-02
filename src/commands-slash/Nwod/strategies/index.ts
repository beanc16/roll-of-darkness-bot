import { logger } from '@beanc16/logger';
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteFocusedOption,
    ChatInputCommandInteraction,
} from 'discord.js';

import { MAX_AUTOCOMPLETE_CHOICES } from '../../../constants/discord.js';
import { BaseStrategyExecutor } from '../../strategies/BaseStrategyExecutor/BaseStrategyExecutor.js';
import { ChatIteractionStrategy, StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
import { AutocompleteHandlerMap, BaseLookupDataOptions } from '../../strategies/types/types.js';
import { NwodSubcommand, NwodSubcommandGroup } from '../options/index.js';
import { NwodLookupSubcommand } from '../options/lookup.js';
import { ChangelingContract } from '../types/ChangelingContract.js';
import { ChangelingGoblinFruit } from '../types/ChangelingGoblinFruit.js';
import { ChangelingNeedle } from '../types/ChangelingNeedle.js';
import { ChangelingThread } from '../types/ChangelingThread.js';
import { ChangelingToken } from '../types/ChangelingToken.js';
import { GeistHaunt } from '../types/GeistHaunt.js';
import { NwodAutocompleteParameterName } from '../types/lookup.js';
import { NwodCondition } from '../types/NwodCondition.js';
import { NwodDreadPower } from '../types/NwodDreadPower.js';
import { NwodMerit } from '../types/NwodMerit.js';
import { NwodNumina } from '../types/NwodNumina.js';
import { NwodTilt } from '../types/NwodTilt.js';
import { NwodWeapon } from '../types/NwodWeapon.js';
import calculateStrategies from './calculate/index.js';
import { ChanceStrategy } from './ChanceStrategy.js';
import { InitiativeStrategy } from './InitiativeStrategy.js';
import lookupStrategies from './lookup/index.js';
import { LuckStrategy } from './LuckStrategy.js';
import randomStrategies from './random/index.js';
import { RollStrategy } from './RollStrategy.js';

interface NwodStrategyExecutorRunParameters
{
    subcommandGroup: NwodSubcommandGroup;
    subcommand: NwodSubcommand;
    interaction: ChatInputCommandInteraction;
};

type NwodStrategyMap = StrategyMap<
    NwodSubcommandGroup,
    NwodSubcommand | NwodLookupSubcommand
>;

interface BaseNwodLookupStrategy<NwodLookupModel> extends ChatIteractionStrategy
{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow in this case
    getLookupData(input: (Record<string, any> & BaseLookupDataOptions)): Promise<NwodLookupModel[]>;
}

export class NwodStrategyExecutor extends BaseStrategyExecutor
{
    private static strategies: NwodStrategyMap = [
        RollStrategy,
        InitiativeStrategy,
        ChanceStrategy,
        LuckStrategy,
    ].reduce<NwodStrategyMap>((acc, cur) =>
    {
        acc[cur.key] = cur;
        return acc;
    }, {
        [NwodSubcommandGroup.Calculate]: calculateStrategies,
        [NwodSubcommandGroup.Lookup]: lookupStrategies,
        [NwodSubcommandGroup.Random]: randomStrategies,
    } as NwodStrategyMap);

    /* istanbul ignore next */
    public static async run({
        subcommandGroup,
        subcommand,
        interaction,
    }: NwodStrategyExecutorRunParameters): Promise<boolean>
    {
        const Strategy = this.getStrategy({
            subcommandGroup,
            strategies: this.strategies,
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
        const autocompleteName = focusedValue.name as NwodAutocompleteParameterName;

        // Get data based on the autocompleteName
        const handlerMap: AutocompleteHandlerMap<NwodAutocompleteParameterName> = {
            [NwodAutocompleteParameterName.ConditionName]: () => NwodStrategyExecutor.getLookupData<NwodCondition>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.Condition,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            }),
            [NwodAutocompleteParameterName.ClarityConditionTag]: async () =>
            {
                const conditions = await NwodStrategyExecutor.getLookupData<NwodCondition>({
                    subcommandGroup: NwodSubcommandGroup.Lookup,
                    subcommand: NwodLookupSubcommand.Condition,
                    options: { includeAllIfNoName: true, sortBy: 'name' },
                });

                const set = conditions.reduce<Set<string>>((acc, cur) =>
                {
                    if (cur.clarityConditionTags)
                    {
                        cur.clarityConditionTags.forEach(tag => acc.add(tag));
                    }

                    return acc;
                }, new Set());

                // Convert to the desired output
                const output: { name: string }[] = [];
                set.forEach(element => output.push({ name: element }));
                output.sort((a, b) => a.name.localeCompare(b.name));
                return output;
            },
            [NwodAutocompleteParameterName.ConditionType]: async () =>
            {
                const conditions = await NwodStrategyExecutor.getLookupData<NwodCondition>({
                    subcommandGroup: NwodSubcommandGroup.Lookup,
                    subcommand: NwodLookupSubcommand.Condition,
                    options: { includeAllIfNoName: true, sortBy: 'name' },
                });

                const set = conditions.reduce<Set<string>>((acc, cur) =>
                {
                    if (cur.types)
                    {
                        cur.types.forEach(tag => acc.add(tag));
                    }

                    return acc;
                }, new Set());

                // Convert to the desired output
                const output: { name: string }[] = [];
                set.forEach(element => output.push({ name: element }));
                output.sort((a, b) => a.name.localeCompare(b.name));
                return output;
            },
            [NwodAutocompleteParameterName.ContractName]: () => NwodStrategyExecutor.getLookupData<ChangelingContract>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.Contract,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            }),
            [NwodAutocompleteParameterName.DreadPowerName]: () => NwodStrategyExecutor.getLookupData<NwodCondition>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.DreadPower,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            }),
            [NwodAutocompleteParameterName.DreadPowerType]: async () =>
            {
                const dreadPowers = await NwodStrategyExecutor.getLookupData<NwodDreadPower>({
                    subcommandGroup: NwodSubcommandGroup.Lookup,
                    subcommand: NwodLookupSubcommand.DreadPower,
                    options: { includeAllIfNoName: true, sortBy: 'name' },
                });

                const set = dreadPowers.reduce<Set<string>>((acc, cur) =>
                {
                    if (cur.types)
                    {
                        cur.types.forEach(type => acc.add(type));
                    }

                    return acc;
                }, new Set());

                // Convert to the desired output
                const output: { name: string }[] = [];
                set.forEach(element => output.push({ name: element }));
                output.sort((a, b) => a.name.localeCompare(b.name));
                return output;
            },
            [NwodAutocompleteParameterName.GoblinFruitName]: () => NwodStrategyExecutor.getLookupData<ChangelingGoblinFruit>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.GoblinFruit,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            }),
            [NwodAutocompleteParameterName.HauntName]: () => NwodStrategyExecutor.getLookupData<GeistHaunt>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.Haunt,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            }),
            [NwodAutocompleteParameterName.KithName]: () => NwodStrategyExecutor.getLookupData<GeistHaunt>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.Kith,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            }),
            [NwodAutocompleteParameterName.MementoName]: () => NwodStrategyExecutor.getLookupData<NwodMerit>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.Memento,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            }),
            [NwodAutocompleteParameterName.MeritName]: () => NwodStrategyExecutor.getLookupData<NwodMerit>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.Merit,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            }),
            [NwodAutocompleteParameterName.NeedleName]: () => NwodStrategyExecutor.getLookupData<ChangelingNeedle>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.Needle,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            }),
            [NwodAutocompleteParameterName.NuminaName]: () => NwodStrategyExecutor.getLookupData<NwodCondition>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.Numina,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            }),
            [NwodAutocompleteParameterName.NuminaType]: async () =>
            {
                const numina = await NwodStrategyExecutor.getLookupData<NwodNumina>({
                    subcommandGroup: NwodSubcommandGroup.Lookup,
                    subcommand: NwodLookupSubcommand.Numina,
                    options: { includeAllIfNoName: true, sortBy: 'name' },
                });

                const set = numina.reduce<Set<string>>((acc, cur) =>
                {
                    if (cur.types)
                    {
                        cur.types.forEach(type => acc.add(type));
                    }

                    return acc;
                }, new Set());

                // Convert to the desired output
                const output: { name: string }[] = [];
                set.forEach(element => output.push({ name: element }));
                output.sort((a, b) => a.name.localeCompare(b.name));
                return output;
            },
            [NwodAutocompleteParameterName.RootAndBloomName]: () => NwodStrategyExecutor.getLookupData<ChangelingNeedle>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.RootAndBloom,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            }),
            [NwodAutocompleteParameterName.ThreadName]: () => NwodStrategyExecutor.getLookupData<ChangelingThread>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.Thread,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            }),
            [NwodAutocompleteParameterName.TiltName]: () => NwodStrategyExecutor.getLookupData<NwodTilt>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.Tilt,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            }),
            [NwodAutocompleteParameterName.TokenName]: () => NwodStrategyExecutor.getLookupData<ChangelingToken>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.Token,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            }),
            [NwodAutocompleteParameterName.WeaponName]: () => NwodStrategyExecutor.getLookupData<NwodWeapon>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.Weapon,
                options: { includeAllIfNoName: true, sortBy: 'name' },
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
    public static async getLookupData<NwodLookupModel>({
        subcommandGroup,
        subcommand,
        options,
    }: {
        subcommandGroup: NwodSubcommandGroup;
        subcommand: NwodSubcommand | NwodLookupSubcommand;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Allow any here
        options: BaseLookupDataOptions & Record<string, any>;
    }): Promise<NwodLookupModel[]>
    {
        const Strategy = super.getStrategy({
            strategies: this.strategies,
            subcommandGroup,
            subcommand,
        }) as BaseNwodLookupStrategy<NwodLookupModel> | undefined;

        if (Strategy)
        {
            return await Strategy.getLookupData(options);
        }

        return [];
    }
}
