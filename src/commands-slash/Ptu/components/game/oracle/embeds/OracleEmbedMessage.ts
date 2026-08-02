import { EmbedBuilder } from 'discord.js';

/**
 * `EmbedBuilder` with defaults for `color` and `description`
 * for use with the oracle games.
 */
export class OracleEmbedMessage extends EmbedBuilder
{
    constructor(args: ConstructorParameters<typeof EmbedBuilder>[0] & {
        title: string;
        descriptionLines: string[];
    })
    {
        const {
            descriptionLines,
            ...rest
        } = args;

        super({
            ...rest,
            color: 0xCDCDCD,
            description: descriptionLines.join('\n'),
        });
    }
}
