import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuRandomSubcommand } from '../../options/random.js';

@staticImplements<ChatIteractionStrategy>()
export class RandomFortuneStrategy
{
    public static key: PtuRandomSubcommand.Fortune = PtuRandomSubcommand.Fortune;

    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        const level = interaction.options.getInteger('level', true);

        // Fortune can only be used at level 20 or higher
        if (level < 20)
        {
            await interaction.editReply('An invalid level was submitted. Level must be 20 or higher.');
            return true;
        }

        // Get money
        const roll = new DiceLiteService({
            count: 1,
            sides: 10,
        }).roll()[0];
        const money = level * roll;

        // Get embed message
        const description = [
            `Result: (${roll})`,
            `${Text.bold('Money')}: $${money}`,
        ].join('\n');
        const embed = new EmbedBuilder()
            .setTitle(`Fortune`)
            .setDescription(description)
            .setColor(0xCDCDCD);

        // Send embed with reroll button
        await RerollStrategy.run({
            interaction,
            options: {
                embeds: [embed],
            },
            rerollCallbackOptions,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: `/ptu ${PtuSubcommandGroup.Random} ${this.key}`,
        });

        return true;
    }
}
