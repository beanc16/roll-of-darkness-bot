import { logger } from '@beanc16/logger';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

import { PtuGenerateSubcommand } from '../../options/generate.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BaseSchema = z.ZodObject<any>;

export class BaseGenerateStrategy
{
    private static llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o-mini',
    });

    protected static async generate<Schema extends BaseSchema>({
        key,
        schema,
        systemInstructions,
        prompt,
    }: {
        key: PtuGenerateSubcommand;
        schema: Schema;
        systemInstructions: string;
        prompt: string;
    }): Promise<{ raw: z.infer<Schema>; jsonString: string } | undefined>
    {
        try
        {
            const llm = this.llm.withStructuredOutput(schema);

            const promptTemplate = ChatPromptTemplate.fromMessages([
                new SystemMessage(systemInstructions),
                new HumanMessage(prompt),
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
            logger.error(`An error occurred in /ptu generate ${key}`, error);
            return undefined;
        }
    }
}
