import { ChatIteractionStrategyRecord } from '../../../strategies/types/ChatIteractionStrategy.js';
import { MediaInstagramSubcommand } from '../../subcommand-groups/instagram.js';
import { InstagramDownloadStrategy } from './InstagramDownloadStrategy.js';

export default {
    [InstagramDownloadStrategy.key]: InstagramDownloadStrategy,
} as ChatIteractionStrategyRecord<MediaInstagramSubcommand>;
