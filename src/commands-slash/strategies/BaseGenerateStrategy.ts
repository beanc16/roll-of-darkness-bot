import { logger } from '@beanc16/logger';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

import { CommandName } from '../../types/discord.js';

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
        schema?: Schema;
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
}
