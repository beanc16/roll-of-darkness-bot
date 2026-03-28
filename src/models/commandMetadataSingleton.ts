import { RecordSingleton } from '../services/Singleton/RecordSingleton.js';

class CommandMetadataSingleton extends RecordSingleton<string, [string, string, string]>
{
}

/**
 * Singleton for command metadata
 *
 * key = messageId
 *
 * value = [commandName, subcommandGroup, subcommand]
 */
export default new CommandMetadataSingleton();
