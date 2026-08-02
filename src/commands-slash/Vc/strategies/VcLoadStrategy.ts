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
        const fileNames: string[] = [];

        for (let index = 1; index <= 10; index += 1)
        {
            const fileName = interaction.options.getString(`file_name_${index}`);
            if (fileName)
            {
                fileNames.push(fileName);
            }
        }

        await interaction.followUp({
            content: `Loading audio...`,
            ephemeral: true,
        });

        await this.load({ interaction, fileNames });

        return true;
    }

    private static async load({ interaction, fileNames }: {
        interaction: ChatInputCommandInteraction;
        fileNames: string[];
    }): Promise<void>
    {
        // eslint-disable-next-line no-async-promise-executor
        return await new Promise<void>(async (resolve) =>
        {
            const validFileNames: string[] = [];
            const invalidFileNames: string[] = [];

            for (let index = 0; index < fileNames.length; index += 1)
            {
                const fileName = fileNames[index];
                // eslint-disable-next-line -- This will always be one-at-a-time at the file retrieval level, so just leave it as such
                const readable = await getAudioResourceReadable({
                    discordUserId: interaction.user.id,
                    fileName,
                    shouldLoop: false,
                });

                if (readable)
                {
                    validFileNames.push(fileName);
                }
                else
                {
                    invalidFileNames.push(fileName);
                }
            }

            // Send valid file names
            if (validFileNames.length > 0)
            {
                // Send message to show the command was received
                await interaction.followUp({
                    content: `\`${validFileNames.join('`, `')}\` loaded.`,
                    ephemeral: true,
                });
            }

            // Send invalid file names
            // eslint-disable-next-line no-nested-ternary -- One layer deep nested ternary is less complex than any alternatives
            const invalidFilesMessage = invalidFileNames.length === 0
                ? ''
                : invalidFileNames.length === 1
                    ? `The file \`${invalidFileNames[0]}\` does not exist.`
                    : `The files \`${invalidFileNames.join('`, `')}\` do not exist.`;

            if (invalidFileNames.length > 0)
            {
                const fileNamesEmbeds = await VcViewFilesStrategy.getFileNamesEmbeds(interaction);
                // Send messages with pagination (fire and forget)
                // eslint-disable-next-line @typescript-eslint/no-floating-promises -- Leave this hanging to free up memory in the node.js event loop.
                PaginationStrategy.run({
                    originalInteraction: interaction,
                    commandName: `/vc load`,
                    content: invalidFilesMessage,
                    embeds: fileNamesEmbeds,
                    interactionType: 'followUp',
                    ephemeral: true,
                });
            }

            resolve();
        });
    }
}
