import { FileStorageMicroserviceImageEffect } from '@beanc16/microservices-abstraction';
import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { MediaImageSubcommand } from '../../../options/subcommand-groups/media/image.js';
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