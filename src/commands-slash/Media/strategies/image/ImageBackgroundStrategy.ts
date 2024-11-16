import { FileStorageMicroserviceImageBackground } from '@beanc16/microservices-abstraction';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { MediaImageSubcommand } from '../../subcommand-groups/image.js';
import { BaseImageStrategy } from './BaseImageStrategy.js';

@staticImplements<ChatIteractionStrategy>()
export class ImageBackgroundStrategy
{
    public static key = MediaImageSubcommand.Background;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
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
