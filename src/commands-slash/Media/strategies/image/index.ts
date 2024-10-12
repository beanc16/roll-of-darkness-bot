import { ImageBackgroundStrategy } from './ImageBackgroundStrategy.js';
import { ImageUpscaleStrategy } from './ImageUpscaleStrategy.js';

export default {
    [ImageBackgroundStrategy.key]: ImageBackgroundStrategy,
    [ImageUpscaleStrategy.key]: ImageUpscaleStrategy,
};
