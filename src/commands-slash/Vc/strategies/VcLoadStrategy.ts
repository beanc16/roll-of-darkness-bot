import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../decorators/staticImplements.js';
import { PaginationStrategy } from '../../strategies/PaginationStrategy/PaginationStrategy.js';
import { ChatIteractionStrategy } from '../../strategies/types/ChatIteractionStrategy.js';
import { getAudioResourceReadable } from '../helpers.js';
import { VcSubcommand } from '../options/index.js';
import { VcViewFilesStrategy } from './VcViewFilesStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class VcLoadStrategy
{
    public static key: VcSubcommand.Load = VcSubcommand.Load;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const fileName = interaction.options.getString('file_name', true);

        await interaction.followUp({
            content: `Loading audio...`,
            ephemeral: true,
        });

        await this.load({ interaction, fileName });

        return true;
    }

    private static async load({ interaction, fileName }: {
        interaction: ChatInputCommandInteraction;
        fileName: string;
    }): Promise<void>
    {
        // eslint-disable-next-line no-async-promise-executor
        return await new Promise<void>(async (resolve) =>
        {
            const readable = await getAudioResourceReadable({
                discordUserId: interaction.user.id,
                fileName,
                shouldLoop: false,
            });

            if (!readable)
            {
                const fileNamesEmbeds = await VcViewFilesStrategy.getFileNamesEmbeds(interaction);
                // Send messages with pagination (fire and forget)
                // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
                PaginationStrategy.run({
                    originalInteraction: interaction,
                    commandName: `/vc load`,
                    content: `A file named \`${fileName}\` does not exist.`,
                    embeds: fileNamesEmbeds,
                    interactionType: 'followUp',
                    ephemeral: true,
                });
                return;
            }

            // Send message to show the command was received
            await interaction.followUp({
                content: `\`${fileName}\` loaded.`,
                ephemeral: true,
            });
            resolve();
        });
    }
}
