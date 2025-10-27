import { logger } from '@beanc16/logger';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatAnthropic } from '@langchain/anthropic';
import {
    type AttachmentPayload,
    type ButtonInteraction,
    EmbedBuilder,
} from 'discord.js';
import { z } from 'zod';

import { timeToWaitForCommandInteractions } from '../../../constants/discord.js';
import type { GenerateResponse, HandlePaginatedChatResponsesInput } from '../../../modals/BaseGenerateModal.js';
import type { CommandName } from '../../../types/discord.js';
import { PaginationStrategy } from '../PaginationStrategy/PaginationStrategy.js';
import { AiButtonName, AiRespondActionRowBuilder } from './components/AiRespondActionRowBuilder.js';

const color = 0xCDCDCD;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BaseSchema = z.ZodObject<any>;

interface ButtonHandlerResponse
{
    embeds?: EmbedBuilder[];
    files?: AttachmentPayload[];
}

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
        const llm = new ChatAnthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
            model: 'claude-sonnet-4-5-20250929',
        });

        if (schema)
        {
            // @ts-expect-error
            return llm.withStructuredOutput(schema);
        }

        return llm;
    }

    /* istanbul ignore next */
    public static async handlePaginatedChatResponses(parameters: HandlePaginatedChatResponsesInput): Promise<void>
    {
        const {
            originalInteraction,
            embeds,
            commandName,
        } = parameters;

        await PaginationStrategy.run({
            originalInteraction,
            commandName,
            embeds,
            rowsAbovePagination: [
                new AiRespondActionRowBuilder(),
            ],
            onRowAbovePaginationButtonPress: async (buttonInteraction, input) => await this.handleButtons(
                parameters,
                buttonInteraction as ButtonInteraction,
                input,
            ),
        });
    }

    /* istanbul ignore next */
    private static async handleButtons({
        Modal,
        originalInteraction,
        commandName,
        generateResponseCallback,
    }: Omit<HandlePaginatedChatResponsesInput, 'embeds'>, buttonInteraction: ButtonInteraction, input: ButtonHandlerResponse): Promise<ButtonHandlerResponse>
    {
        return await new Promise(async (resolve) =>
        {
            await Modal.showModal(buttonInteraction, {
                Modal,
                originalInteraction,
                embeds: input.embeds,
                commandName,
                generateResponseCallback,
            });

            const modalSubmitInteraction = await buttonInteraction.awaitModalSubmit({
                filter: (i) => (i.user.id === originalInteraction.user.id),
                time: timeToWaitForCommandInteractions,
            });

            const handlerMap: Record<AiButtonName, () => Promise<GenerateResponse | undefined>> = {
                [AiButtonName.Respond]: async () => await Modal.generate(modalSubmitInteraction),
            };

            const response = await handlerMap[buttonInteraction.customId as AiButtonName]();

            // Failed Response
            if (response === undefined)
            {
                resolve(input);
            }

            // Successful Response
            else
            {
                resolve(response);
            }
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
