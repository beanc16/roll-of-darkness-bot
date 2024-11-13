import { FileStorageMicroserviceImageEffect } from '@beanc16/microservices-abstraction';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { MediaImageSubcommand } from '../../subcommand-groups/image.js';
import { BaseImageStrategy } from './BaseImageStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class ImageUpscaleStrategy
{
    public static key = MediaImageSubcommand.Upscale;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        return await BaseImageStrategy.run(interaction, {
            effect: FileStorageMicroserviceImageEffect.Upscale,
        });
    }
}
