import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { rollOfDarknessPtuSpreadsheetId } from '../../constants.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuRandomSubcommand } from '../../options/random.js';
import { RandomResult } from '../../types/PtuRandom.js';
import { BaseRandomStrategy } from './BaseRandomStrategy.js';

enum MushroomType
{
    Tiny = 'Tiny Mushroom',
    Big = 'Big Mushroom',
    Balm = 'Balm Mushroom',
}

@staticImplements<ChatIteractionStrategy>()
export class RandomMushroomStrategy
{
    public static key: PtuRandomSubcommand.Mushroom = PtuRandomSubcommand.Mushroom;

    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        const level = interaction.options.getInteger('pokemon_level', true);

        // Mushroom Gather can only be used at level 20 or higher
        if (level < 20)
        {
            await interaction.editReply('An invalid level was submitted. Level must be 20 or higher.');
            return true;
        }

        // Get mushroom data
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessPtuSpreadsheetId,
            range: `'${BaseRandomStrategy.subcommandToStrings[this.key].data} Data'!A2:D`,
        });

        // Parse the data
        const parsedData = data.reduce<RandomResult[]>((acc, [name, cost, description]) =>
        {
            if (this.shouldInclude({ name }))
            {
                acc.push({
                    name,
                    cost,
                    description,
                });
            }

            return acc;
        }, []);

        // Get mushroom
        const roll = new DiceLiteService({
            count: 1,
            sides: 20,
        }).roll()[0];
        const mushroomType = this.getMushroomType(roll);
        const mushroom = parsedData.find(({ name: mushroomName }) =>
            mushroomName === mushroomType.toString(),
        );

        // Get embed message
        const description = [
            `Result: (${roll})\n`,
            ...(mushroom
                ? [
                    `${Text.bold(mushroom.name)}`,
                    ...(mushroom.description !== undefined && mushroom.description !== '--'
                        ? [
                            `Description:\n\`\`\`\n${mushroom.description}\`\`\``,
                        ]
                        : []
                    ),
                ]
                : []
            ),
        ].join('\n');
        const embed = new EmbedBuilder()
            .setTitle(`Mushroom Gather`)
            .setDescription(description)
            .setColor(0xCDCDCD);

        // Send embed with reroll button
        await RerollStrategy.run({
            interaction,
            options: {
                embeds: [embed],
            },
            interactionCallbackType: rerollCallbackOptions.interactionCallbackType,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: `/ptu ${PtuSubcommandGroup.Random} ${this.key}`,
        });

        return true;
    }

    /* istanbul ignore next */
    private static shouldInclude({ name }: { name: string }): boolean
    {
        return name.toLowerCase().includes('mushroom');
    };

    private static getMushroomType(roll: number): MushroomType
    {
        if (roll >= 1 && roll <= 12)
        {
            return MushroomType.Tiny;
        }

        if (roll >= 13 && roll <= 18)
        {
            return MushroomType.Big;
        }

        return MushroomType.Balm;
    }
}
