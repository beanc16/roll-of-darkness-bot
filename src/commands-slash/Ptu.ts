import { BaseSlashCommand } from '@beanc16/discordjs-common-commands';
import { ChatInputCommandInteraction } from 'discord.js';

import * as options from './options';
import { CachedGoogleSheetsApiService } from '../services/CachedGoogleSheetsApiService';
import { BerryTier } from './options/subcommand-groups/ptu/random';
import { DiceLiteService } from '../services/DiceLiteService';
import { getRandomBerriesEmbedMessage } from './embed-messages/ptu/random';

enum PtuSubcommandGroup
{
    Random = 'random',
}

enum PtuSubcommand
{
    Berry = 'berry',
}

type SubcommandHandlers = Record<
    PtuSubcommandGroup,
    Record<
        PtuSubcommand,
        (interaction: ChatInputCommandInteraction) => Promise<boolean>
    >
>;

export interface Berry
{
    name: string;
    cost: string;
    tier: number;
    description: string;
    numOfTimesRolled?: number;
}

class Ptu extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addSubcommandGroup(options.subcommandGroups.random);
    }

    private subcommandHandlers: SubcommandHandlers = {
        [PtuSubcommandGroup.Random]: {
            [PtuSubcommand.Berry]: async (interaction: ChatInputCommandInteraction) =>
            {
                // Get parameter results
                const numberOfDice = interaction.options.getInteger('number_of_dice') as number;
                const inputTier = interaction.options.getString('berry_tier') || BerryTier.OnePlus;

                const { data = [] } = await CachedGoogleSheetsApiService.getRange({
                    // TODO: Make this spreadsheet id a constant later
                    spreadsheetId: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI',
                    range: `'Berry Data'!A2:D`,
                });

                // TODO: Move helper elsewhere in the future
                const shouldIncludeBerry = ({ inputTier, tier }: { inputTier: string, tier: number }) =>
                {
                    if (inputTier === BerryTier.OnePlus && tier >= 1) return true;
                    if (inputTier === BerryTier.One && tier === 1) return true;
                    if (inputTier === BerryTier.TwoPlus && tier >= 2) return true;
                    if (inputTier === BerryTier.Two && tier === 2) return true;
                    if (inputTier === BerryTier.Three && tier === 3) return true;
                    return false;
                };

                // Parse the data
                const berriesData = data.reduce((acc, [name, cost, unparsedTier, description]) => {
                    const tier = parseInt(unparsedTier, 10);

                    if (shouldIncludeBerry({ inputTier, tier }))
                    {
                        acc.push({
                            name,
                            cost,
                            tier,
                            description,
                        });
                    }

                    return acc;
                }, [] as Berry[]);

                // Get random numbers
                const rollResult = new DiceLiteService({
                    count: numberOfDice,
                    sides: berriesData.length,
                }).roll();
                const rollResults = rollResult.join(', ');

                const uniqueRolls = rollResult.reduce((acc, cur) => {
                    const index = acc.findIndex(({ result }) => result === cur);

                    if (index > 0)
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

                // Get random berries
                const berries = uniqueRolls.map(({ result, numOfTimesRolled }) => {
                    return {
                        ...berriesData[result - 1],
                        numOfTimesRolled,
                    };
                });

                // Get message
                const embed = getRandomBerriesEmbedMessage({
                    berries,
                    rollResults,
                });

                // Send embed
                await interaction.editReply({
                    embeds: [embed],
                });

                return true;
            },
        },
    };

    async run(interaction: ChatInputCommandInteraction)
    {
        // Send message to show the command was received
        await interaction.deferReply({
            fetchReply: true,
        });

        // Get parameter results
        const subcommandGroup = interaction.options.getSubcommandGroup() as PtuSubcommandGroup;
        const subcommand = interaction.options.getSubcommand() as PtuSubcommand;

        // Get handler
        const handler = this.subcommandHandlers[subcommandGroup][subcommand];

        // Run subcommand
        const response = (handler !== undefined)
            ? await handler(interaction)
            : false;

        // Send response if the handler failed or was undefined
        if (!response)
        {
            await interaction.editReply('Subcommand Group or subcommand not yet implemented');
        }
    }

    get description()
    {
        return `Run PTU commands.`;
    }
}

export default new Ptu();
