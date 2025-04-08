import { logger } from '@beanc16/logger';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from 'discord.js';
import { z } from 'zod';

import { timeToWaitForCommandInteractions } from '../../constants/discord.js';
import type { HandlePaginatedChatResponsesInput } from '../../modals/BaseGenerateModal.js';
import type { CommandName } from '../../types/discord.js';
import { PaginationStrategy } from './PaginationStrategy/PaginationStrategy.js';

const color = 0xCDCDCD;

enum AiButtonName
{
    Respond = 'Respond',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BaseSchema = z.ZodObject<any>;

export class BaseGenerateStrategy
{
    /* istanbul ignore next */
    protected static async generate<Schema extends BaseSchema>({
        schema,
        systemInstructions,
        prompt,
        commandName,
    }: {
        schema: Schema;
        systemInstructions?: string | null;
        prompt: string | null;
        commandName: CommandName;
    }): Promise<{ raw: z.infer<Schema>; jsonString: string } | undefined>
    {
        try
        {
            const llm = this.getLlm(schema);

            const promptTemplate = ChatPromptTemplate.fromMessages([
                ...(systemInstructions ? [new SystemMessage(systemInstructions)] : []),
                ...(prompt ? [new HumanMessage(prompt)] : []),
            ]);

            const chain = promptTemplate.pipe(llm);

            const response = await chain.invoke({});

            return {
                raw: response,
                jsonString: `\`\`\`json\n${
                    JSON.stringify(response, null, 2)
                }\n\`\`\``,
            };
        }
        catch (error)
        {
            logger.error(`An error occurred in ${commandName}`, error);
            return undefined;
        }
    }

    /* istanbul ignore next */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- Allow TS to infer
    private static getLlm<Schema extends BaseSchema>(schema?: Schema)
    {
        const llm = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            model: 'gpt-4o-mini',
        });

        if (schema)
        {
            return llm.withStructuredOutput(schema);
        }

        return llm;
    }

    public static async handlePaginatedChatResponses({
        Modal,
        originalInteraction,
        embeds,
        commandName,
        generateResponseCallback,
    }: HandlePaginatedChatResponsesInput): Promise<void>
    {
        await PaginationStrategy.run({
            originalInteraction,
            commandName,
            embeds,
            // TODO: Add button to display the user's prompt for the current response
            rowsAbovePagination: [
                new ActionRowBuilder<ButtonBuilder>({
                    components: [
                        new ButtonBuilder({
                            customId: AiButtonName.Respond,
                            label: AiButtonName.Respond,
                            emoji: '🗨️',
                            style: ButtonStyle.Secondary,
                        }),
                    ],
                }),
            ],
            onRowAbovePaginationButtonPress: async (buttonInteraction, { embeds: inputEmbeds }) =>
            {
                return await new Promise(async (resolve) =>
                {
                    await Modal.showModal(buttonInteraction, {
                        Modal,
                        originalInteraction,
                        embeds: inputEmbeds,
                        commandName,
                        generateResponseCallback,
                    });

                    const modalSubmitInteraction = await buttonInteraction.awaitModalSubmit({
                        filter: (i) => (i.user.id === originalInteraction.user.id),
                        time: timeToWaitForCommandInteractions,
                    });

                    const response = await Modal.generate(modalSubmitInteraction);

                    // Failed Response
                    if (response === undefined)
                    {
                        resolve({ embeds: inputEmbeds });
                    }

                    // Successful Response
                    else
                    {
                        resolve(response);
                    }
                });
            },
        });
    }

    /* istanbul ignore next */
    protected static getEmbed({
        title,
        description,
        footer,
    }: { title: string; description: string; footer?: string }): EmbedBuilder
    {
        const embed = new EmbedBuilder({
            title,
            description,
            color,
        });

        if (footer)
        {
            embed.setFooter({ text: footer });
        }

        return embed;
    }
}
