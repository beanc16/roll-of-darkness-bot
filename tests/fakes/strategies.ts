import { ChatIteractionStrategy } from '../../src/commands-slash/strategies/types/ChatIteractionStrategy.js';
import { staticImplements } from '../../src/decorators/staticImplements.js';
import { FakeChatInputCommandInteraction } from './discord.js';

@staticImplements<ChatIteractionStrategy>()
export class FakeChatInteractionStrategy
{
    public static key = 'some-key';

    public static run(_interaction: FakeChatInputCommandInteraction): Promise<boolean>
    {
        return new Promise((resolve) =>
        {
            resolve(true);
        });
    }
}
