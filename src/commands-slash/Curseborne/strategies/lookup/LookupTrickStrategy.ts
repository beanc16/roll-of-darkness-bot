import { ChatInputCommandInteraction } from 'discord.js';

import { BaseCurseborneLookupStrategy } from './BaseCurseborneLookupStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CurseborneLookupSubcommand } from '../../subcommand-groups/lookup.js';
import { rollOfDarknessCurseborneSpreadsheetId } from '../../constants.js';
import { CurseborneTrick } from '../../models/CurseborneTrick.js';
import {
    BaseGetLookupDataParams,
    BaseGetLookupSearchMatchType,
    BaseLookupStrategy,
    LookupStrategy,
} from '../../../strategies/BaseLookupStrategy.js';

export interface GetLookupTrickDataParameters extends BaseGetLookupDataParams
{
    name?: string | null;
}

@staticImplements<BaseLookupStrategy<GetLookupTrickDataParameters, CurseborneTrick>>()
export class LookupTrickStrategy
{
    public static key = CurseborneLookupSubcommand.Trick;

    public static async run(
        interaction: ChatInputCommandInteraction,
    ): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString('trick_name', true);

        // Get data
        const data = await this.getLookupData({
            name,
            options: {
                matchType: BaseGetLookupSearchMatchType.ExactMatch,
            },
        });

        // Send message
        return await BaseCurseborneLookupStrategy.run({
            interaction,
            data,
            embedTitle: 'Tricks',
        });
    }

    public static async getLookupData(input: GetLookupTrickDataParameters)
    {
        const { options, ...remainingProperties } = input;
        const numOfKeys = Object.keys(remainingProperties).length;

        const {
            options: {
                matchType,
            },
        } = input;

        const hasMatch = ({
            inputValue,
            elementValue,
        }: {
            inputValue?: string | null | undefined;
            elementValue: string;
        }) =>
        {
            const map: Record<BaseGetLookupSearchMatchType, boolean> = {
                [BaseGetLookupSearchMatchType.ExactMatch]: (
                    inputValue !== undefined
                    && inputValue !== null
                    && inputValue === elementValue
                ),
                [BaseGetLookupSearchMatchType.SubstringMatch]: (
                    inputValue !== undefined
                    && inputValue !== null
                    && elementValue.toLowerCase().includes(inputValue.toLowerCase())
                ),
            };

            return map[matchType];
        };

        return await LookupStrategy.getLookupData({
            Class: CurseborneTrick,
            range: `'Tricks Data'!A2:Z`,
            spreadsheetId: rollOfDarknessCurseborneSpreadsheetId,
            reduceCallback: (acc, cur) =>
            {
                const element = new CurseborneTrick(cur);

                if (
                    numOfKeys === 0
                    || hasMatch({
                        inputValue: input.name,
                        elementValue: element.name,
                    })
                )
                {
                    acc.push(element);
                }

                return acc;
            },
        });
    }
}
