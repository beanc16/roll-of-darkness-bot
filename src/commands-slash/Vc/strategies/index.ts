import { logger } from '@beanc16/logger';
import {
    ApplicationCommandOptionChoiceData,
    AutocompleteFocusedOption,
    ChatInputCommandInteraction,
} from 'discord.js';

import { MAX_AUTOCOMPLETE_CHOICES } from '../../../constants/discord.js';
import { BaseStrategyExecutor } from '../../strategies/BaseStrategyExecutor/BaseStrategyExecutor.js';
import { StrategyMap } from '../../strategies/types/ChatIteractionStrategy.js';
import { VcSubcommand, VcSubcommandGroup } from '../options/index.js';
import { VcQueueSubcommand } from '../options/queue.js';
import { VcAutocompleteRegistry } from '../services/VcAutocompleteRegistry.js';
import { VcAutocompleteParameterName } from '../types.js';
import queueStrategies from './queue/index.js';
import { VcConnectStrategy } from './VcConnectStrategy.js';
import { VcDeleteFileStrategy } from './VcDeleteFileStrategy.js';
import { VcDisconnectStrategy } from './VcDisconnectStrategy.js';
import { VcLoadStrategy } from './VcLoadStrategy.js';
import { VcNextStrategy } from './VcNextStrategy.js';
import { VcPauseStrategy } from './VcPauseStrategy.js';
import { VcPlayStrategy } from './VcPlayStrategy.js';
import { VcPreviousStrategy } from './VcPreviousStrategy.js';
import { VcRenameFileStrategy } from './VcRenameFileStrategy.js';
import { VcStopStrategy } from './VcStopStrategy.js';
import { VcUnpauseStrategy } from './VcUnpauseStrategy.js';
import { VcUploadFileStrategy } from './VcUploadFileStrategy.js';
import { VcViewFilesStrategy } from './VcViewFilesStrategy.js';

interface VcStrategyExecutorRunParameters
{
    subcommandGroup?: VcSubcommandGroup;
    subcommand: VcSubcommand;
    interaction: ChatInputCommandInteraction;
};

type VcStrategyMap = StrategyMap<
    VcSubcommandGroup,
    VcSubcommand | VcQueueSubcommand
>;

export class VcStrategyExecutor extends BaseStrategyExecutor
{
    private static autoCompleteRegistry = new VcAutocompleteRegistry();
    private static strategies: VcStrategyMap = {
        [VcSubcommandGroup.Queue]: queueStrategies,
        ...[ // Subcommands without a subcommand group
            VcConnectStrategy,
            VcDeleteFileStrategy,
            VcDisconnectStrategy,
            VcLoadStrategy,
            VcNextStrategy,
            VcPauseStrategy,
            VcPlayStrategy,
            VcPreviousStrategy,
            VcRenameFileStrategy,
            VcStopStrategy,
            VcUnpauseStrategy,
            VcUploadFileStrategy,
            VcViewFilesStrategy,
        ].reduce<Partial<VcStrategyMap>>((acc, cur) =>
        {
            acc[cur.key] = cur;
            return acc;
        }, {} as Partial<VcStrategyMap>),
    };

    public static async run({
        subcommandGroup,
        subcommand,
        interaction,
    }: VcStrategyExecutorRunParameters): Promise<boolean>
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

    public static async getAutocompleteChoices(
        focusedValue: AutocompleteFocusedOption,
        userId: string,
    ): Promise<ApplicationCommandOptionChoiceData<string>[]>
    {
        const autocompleteName = focusedValue.name as VcAutocompleteParameterName;

        const data = await this.autoCompleteRegistry.executeHandler(autocompleteName, userId);

        // Handle enums not being set properly
        if (!data)
        {
            logger.error(`Failed to get autocomplete data. Ensure that all enums and handlers are set up as intended in ${this.name}`, { autocompleteName });
            return [];
        }

        // Narrow down the choices
        const choiceValues = data.reduce<string[]>((acc, { fileName }) =>
        {
            // Only get file names that include the search term
            if (fileName.toLowerCase().includes(focusedValue.value.toLowerCase()))
            {
                acc.push(fileName);
            }
            return acc;
            /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
        }, []);

        // Parse data to discord's format
        const choices = [...choiceValues].sort().map<ApplicationCommandOptionChoiceData<string>>((value) =>
        {
            return {
                name: value,
                value,
            };
        });

        // Discord limits a maximum of 25 choices to display
        return choices.slice(0, MAX_AUTOCOMPLETE_CHOICES);
    }
}
