import { Text } from '@beanc16/discordjs-helpers';
import {
    type APIEmbedField,
    EmbedBuilder,
    type User,
} from 'discord.js';

export type HangmonEmbedField = Pick<APIEmbedField, 'name' | 'value'>;

interface HangmonEmbedMessageOptions
{
    user: User;
    players: User[];
    fields: HangmonEmbedField[];
    maxAttempts: number;
}

export class HangmonEmbedMessage extends EmbedBuilder
{
    private attempts: number;
    private maxAttempts: number;

    constructor({
        user,
        players,
        fields = [],
        maxAttempts,
    }: HangmonEmbedMessageOptions)
    {
        super({
            title: 'Hangmon',
            description: `Players: ${players.map(player => Text.Ping.user(player.id)).join(', ')}`,
            fields: fields.map(({ name, value }) => ({
                name,
                value: Text.Code.multiLine(value),
                inline: true,
            })),
            thumbnail: {
                url: user.displayAvatarURL(),
            },
        });

        this.attempts = 0;
        this.maxAttempts = maxAttempts;
        this.setAttempts(0);
    }

    private setAttempts(attempts: number): this
    {
        this.attempts = attempts;
        super.setFooter({
            text: `🔢 Attempts: ${this.attempts}/${this.maxAttempts}`,
        });
        return this;
    }

    public incrementAttempts(): this
    {
        return this.setAttempts(this.maxAttempts + 1);
    }
}
