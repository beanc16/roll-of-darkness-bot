import { FileStorageMicroserviceImageBackground } from '@beanc16/microservices-abstraction';
import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../ChatIteractionStrategy.js';
import { staticImplements } from '../../../../decorators/staticImplements.js';
import { MediaImageSubcommand } from '../../../options/subcommand-groups/media/image.js';
import { BaseImageStrategy } from './BaseImageStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class ImageBackgroundStrategy
{
    public static key = MediaImageSubcommand.Background;

    static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const backgroundColor = interaction.options.getString('color') as FileStorageMicroserviceImageBackground | null;
        const rgbHexCode = interaction.options.getString('hex_code');

        const background = backgroundColor ?? rgbHexCode;

        if (!background)
        {
            await interaction.editReply('Invalid parameters were submitted. Include a color or hex_code.');
            return false;
        }

        return await BaseImageStrategy.run(interaction, {
            background,
        });
    }
}
