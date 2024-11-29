import {
    ApplicationCommandOptionChoiceData,
    AutocompleteFocusedOption,
    ChatInputCommandInteraction,
} from 'discord.js';

import { MAX_AUTOCOMPLETE_CHOICES } from '../../../constants/discord.js';
import { BaseStrategyExecutor } from '../../strategies/BaseStrategyExecutor.js';
import { ChatIteractionStrategy, StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../strategies/types/types.js';
import { NwodSubcommand, NwodSubcommandGroup } from '../options/index.js';
import { NwodLookupSubcommand } from '../options/lookup.js';
import { ChangelingContract } from '../types/ChangelingContract.js';
import { NwodCondition } from '../types/NwodCondition.js';
import { NwodMerit } from '../types/NwodMerit.js';
import { ChanceStrategy } from './ChanceStrategy.js';
import { InitiativeStrategy } from './InitiativeStrategy.js';
import lookupStrategies from './lookup/index.js';
import { LuckStrategy } from './LuckStrategy.js';
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
        [NwodSubcommandGroup.Lookup]: lookupStrategies,
    } as NwodStrategyMap);

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

    // TODO: Dry this out with strategy pattern later. Make it part of PtuStrategyExecutor.
    public static async getAutocompleteChoices(focusedValue: AutocompleteFocusedOption): Promise<ApplicationCommandOptionChoiceData<string>[]>
    {
        let data: { name: string }[] = [];
        let choices: ApplicationCommandOptionChoiceData<string>[] = [];

        // Merit Name
        if (focusedValue.name === 'merit_name')
        {
            data = await NwodStrategyExecutor.getLookupData<NwodMerit>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.Merit,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            });
        }

        // Contract Name
        if (focusedValue.name === 'contract_name')
        {
            data = await NwodStrategyExecutor.getLookupData<ChangelingContract>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.Contract,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            });
        }

        // Condition Name
        if (focusedValue.name === 'condition_name')
        {
            data = await NwodStrategyExecutor.getLookupData<NwodCondition>({
                subcommandGroup: NwodSubcommandGroup.Lookup,
                subcommand: NwodLookupSubcommand.Condition,
                options: { includeAllIfNoName: true, sortBy: 'name' },
            });
        }

        // Parse data to discord's format
        choices = data.map<ApplicationCommandOptionChoiceData<string>>(({ name }) =>
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
