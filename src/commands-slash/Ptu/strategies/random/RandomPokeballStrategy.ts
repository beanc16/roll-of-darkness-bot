import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuRandomSubcommand } from '../../subcommand-groups/random.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService.js';
import { RandomPokeball } from '../../../Ptu.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { getRandomPokeballEmbedMessage } from '../../../Ptu/embed-messages/random.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { PtuRandomPickupSubcommandResponse, PtuRandomPickupSubcommandStrategy } from './types.js';

enum PokeballType
{
    Normal = 'Normal',
    Special = 'Special',
    Safari = 'Safari',
    Jailbreaker = 'Jailbreaker Ball',
    Case = 'Jailbreaker Case',
    Attachment = 'Jailbreaker Attachment',
    Master = 'Master',
}

@staticImplements<PtuRandomPickupSubcommandStrategy>()
export class RandomPokeballStrategy
{
    public static key = PtuRandomSubcommand.Pokeball;

    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
        shouldReturnMessageOptions = false
    ): Promise<boolean | PtuRandomPickupSubcommandResponse>
    {
        // Get parameter results
        const numberOfDice = interaction.options.getInteger('number_of_dice') || 1;
        const includeSpecial = interaction.options.getBoolean('include_special') || false;
        const includeSafari = interaction.options.getBoolean('include_safari') || false;
        const includeJailbreaker = interaction.options.getBoolean('include_jailbreaker') || false;
        const includeCases = interaction.options.getBoolean('include_cases') || false;
        const includeAttachments = interaction.options.getBoolean('include_attachments') || false;
        const includeMaster = interaction.options.getBoolean('include_master') || false;

        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'${BaseRandomStrategy.subcommandToStrings[
                PtuRandomSubcommand.Pokeball
            ].data} Data'!A2:E`,
        });

        const shouldInclude = ({ type, includeSpecial, includeSafari, includeJailbreaker, includeCases, includeAttachments, includeMaster }: { type: string, includeSpecial: boolean, includeSafari: boolean, includeJailbreaker: boolean, includeCases: boolean, includeAttachments: boolean, includeMaster: boolean }) =>
        {
            return (
                type === PokeballType.Normal
                || (type === PokeballType.Special && includeSpecial)
                || (type === PokeballType.Safari && includeSafari)
                || (type === PokeballType.Jailbreaker && includeJailbreaker)
                || (type === PokeballType.Case && includeCases)
                || (type === PokeballType.Attachment && includeAttachments)
                || (type === PokeballType.Master && includeMaster)
            );
        };

        // Parse the data
        const parsedData = data.reduce<RandomPokeball[]>((acc, [name, cost, mod, type, description]) => {
            if (shouldInclude({
                type,
                includeSpecial,
                includeSafari,
                includeJailbreaker,
                includeCases,
                includeAttachments,
                includeMaster,
            }))
            {
                acc.push({
                    name,
                    cost,
                    description,
                    mod,
                    type,
                });
            }

            return acc;
        }, []);

        const parsedDataOnlyPokeballs = data.reduce<RandomPokeball[]>((acc, [
            name,
            cost,
            mod,
            type,
            description
        ]) => {
            if (shouldInclude({
                type,
                includeSpecial,
                includeSafari,
                includeJailbreaker,
                includeCases: false,
                includeAttachments: false,
                includeMaster,
            }))
            {
                acc.push({
                    name,
                    cost,
                    description,
                    mod,
                    type,
                });
            }

            return acc;
        }, []);

        // Get random numbers
        const rollResult = new DiceLiteService({
            count: numberOfDice,
            sides: parsedData.length,
        }).roll();
        const rollResults = rollResult.join(', '); // TODO: Dynamically generate this, including rerolls later.

        const uniqueRolls = rollResult.reduce((acc, cur) => {
            const index = acc.findIndex(({ result }) => result === cur);

            if (index >= 0)
            {
                acc[index].numOfTimesRolled += 1;
            }
            else
            {
                acc.push({
                    result: cur,
                    numOfTimesRolled: 1,
                });
            }

            return acc;
        }, [] as {
            result: number;
            numOfTimesRolled: number;
        }[]); // TODO: Make unique rolls for rerolls be grouped together with a CompositeKeyRecord for ball name and jailbreak info name later

        // Get random items
        const results = uniqueRolls.reduce<RandomPokeball[]>((acc, { result, numOfTimesRolled }) => {
            const pokeball = parsedData[result - 1];

            // Reroll for pokeballs to put the case(s) or attachment(s) on
            if (pokeball.type === PokeballType.Case || pokeball.type === PokeballType.Attachment)
            {
                const newPokeballs = this.rerollForPokeballsOnly(
                    numOfTimesRolled,
                    pokeball,
                    parsedDataOnlyPokeballs
                );
                acc.push(...newPokeballs);
            }

            // Regular pokeballs
            else
            {
                acc.push({
                    ...parsedData[result - 1],
                    numOfTimesRolled,
                });
            }

            return acc;
        }, []);

        // Get message
        const embed = getRandomPokeballEmbedMessage({
            itemNamePluralized: BaseRandomStrategy.subcommandToStrings[
                PtuRandomSubcommand.Pokeball
            ].plural,
            results,
            rollResults,
        });

        if (shouldReturnMessageOptions)
        {
            return {
                options: {
                    embeds: [embed],
                },
                commandName: `ptu random ${this.key}`,
            };
        }

        // Send embed with reroll button
        await RerollStrategy.run({
            interaction,
            options: {
                embeds: [embed],
            },
            interactionCallbackType: rerollCallbackOptions.interactionCallbackType,
            onRerollCallback: (newRerollCallbackOptions) => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: `ptu random ${this.key}`,
        });

        return true;
    }

    private static rerollForPokeballsOnly = (
        numberOfTimesToRoll: number,
        jailbreakerInfo: RandomPokeball,
        parsedDataOnlyPokeballs: RandomPokeball[]
    ) =>
    {
        const rollResult = new DiceLiteService({
            count: numberOfTimesToRoll,
            sides: parsedDataOnlyPokeballs.length,
        }).roll();

        const uniqueRolls = rollResult.reduce((acc, cur) => {
            const index = acc.findIndex(({ result }) => result === cur);

            if (index >= 0)
            {
                acc[index].numOfTimesRolled += 1;
            }
            else
            {
                acc.push({
                    result: cur,
                    numOfTimesRolled: 1,
                });
            }

            return acc;
        }, [] as {
            result: number;
            numOfTimesRolled: number;
        }[]);

        return uniqueRolls.map(({ result, numOfTimesRolled }) => {
            return {
                ...parsedDataOnlyPokeballs[result - 1],
                numOfTimesRolled,
                jailBreakerInfo: jailbreakerInfo,
            };
        });
    }
}
