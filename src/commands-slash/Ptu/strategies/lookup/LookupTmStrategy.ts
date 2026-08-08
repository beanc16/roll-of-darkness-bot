import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../shared/embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName, PtuLookupRange } from '../../types/autocomplete.js';
import type { GetLookupMoveDataParameters } from '../../types/modelParameters.js';
import { PtuTm } from '../../types/PtuTm.js';
import type { PtuLookupIteractionStrategy, PtuStrategyMap } from '../../types/strategies.js';
import type { LookupMoveStrategy } from './LookupMoveStrategy.js';
import { EqualityOption } from '../../../shared/options/shared.js';
import { PokemonMoveCategory, PokemonType, PtuContestStatEffect, PtuContestStatType, PtuMoveFrequency, PtuMoveListType } from '../../types/pokemon.js';

export interface GetLookupTmDataParameters extends Omit<GetLookupMoveDataParameters, 'names'>
{
    name?: string | null;
    strategies: PtuStrategyMap;
}

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupTmStrategy
{
    public static key: PtuLookupSubcommand.Tm = PtuLookupSubcommand.Tm;

    public static async run(interaction: ChatInputCommandInteraction, strategies: PtuStrategyMap): Promise<boolean>
    {
        // Get parameter results
        const options = this.getOptions(interaction);

        const data = await this.getLookupData({
            ...options,
            includeAllIfNoName: false,
            strategies,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'TMs',
            parseElementToLines: element => [
                Text.bold(element.name),
                ...(element.cost !== undefined ? [`Cost: ${element.cost}`] : []),
                ...(element.description !== undefined && element.description !== '--'
                    ? [
                        `Description:\n\`\`\`\n${element.description}\`\`\``,
                    ]
                    : ['']
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Tm}`,
            noEmbedsErrorMessage: 'No tms were found.',
        });
    }

    public static async getLookupData(input: GetLookupTmDataParameters): Promise<PtuTm[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: PtuLookupRange.Tm,
        });

        // Should also look up moves
        const moveNamesSet = new Set<string>();
        const { name: _, strategies, ...rest } = input || {};
        if (Object.keys(rest).length > 0)
        {
            const moves = await (strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Move] as typeof LookupMoveStrategy)?.getLookupData(rest);
            moves.forEach(move => moveNamesSet.add(move.name));
        }

        const output = data.reduce<PtuTm[]>((acc, cur) =>
        {
            const element = new PtuTm(cur);

            // Filter out empty rows (necessary since this data sheet
            // uses formulas and thus has some empty rows)
            if (element.name === '')
            {
                return acc;
            }

            // Name
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Moves lookup
            if (moveNamesSet.size > 0 && !moveNamesSet.has(element.name))
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

    private static getOptions(interaction: ChatInputCommandInteraction): Omit<GetLookupTmDataParameters, 'strategies'>
    {
        const name = interaction.options.getString(PtuAutocompleteParameterName.TmName);
        const type = interaction.options.getString(PtuAutocompleteParameterName.PokemonType) as PokemonType | null;
        const category = interaction.options.getString(PtuAutocompleteParameterName.MoveCategory) as PokemonMoveCategory | null;
        const db = interaction.options.getInteger('damage_base');
        const dbEquality = interaction.options.getString('damage_base_equality') as EqualityOption;
        const frequency = interaction.options.getString(PtuAutocompleteParameterName.MoveFrequency) as PtuMoveFrequency | null;
        const ac = interaction.options.getInteger('ac');
        const acEquality = interaction.options.getString('ac_equality') as EqualityOption;
        const keywordName = interaction.options.getString(PtuAutocompleteParameterName.KeywordName);
        const moveListType = interaction.options.getString('move_list_type') as PtuMoveListType | null;
        const contestStatType = interaction.options.getString(PtuAutocompleteParameterName.ContestStatType) as PtuContestStatType | null;
        const contestStatEffect = interaction.options.getString(PtuAutocompleteParameterName.ContestStatEffect) as PtuContestStatEffect | null;
        const basedOn = interaction.options.getString(PtuAutocompleteParameterName.BasedOnMove);
        const nameSearch = interaction.options.getString('name_search');
        const rangeSearch = interaction.options.getString('range_search');
        const effectSearch = interaction.options.getString('effect_search');

        return {
            name,
            type,
            category,
            db,
            dbEquality,
            frequency,
            ac,
            acEquality,
            keywordName,
            moveListType,
            contestStatType,
            contestStatEffect,
            basedOn,
            nameSearch,
            rangeSearch,
            effectSearch,
        };
    }
}
