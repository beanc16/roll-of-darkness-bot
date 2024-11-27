import { ChatIteractionStrategyRecord } from '../../../strategies/types/ChatIteractionStrategy.js';
import { MediaImageSubcommand } from '../../subcommand-groups/image.js';
import { ImageBackgroundStrategy } from './ImageBackgroundStrategy.js';
import { ImageUpscaleStrategy } from './ImageUpscaleStrategy.js';

export default {
    [ImageBackgroundStrategy.key]: ImageBackgroundStrategy,
    [ImageUpscaleStrategy.key]: ImageUpscaleStrategy,
} as ChatIteractionStrategyRecord<MediaImageSubcommand>;
