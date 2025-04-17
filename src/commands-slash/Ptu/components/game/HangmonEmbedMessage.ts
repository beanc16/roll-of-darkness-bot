import { Text } from '@beanc16/discordjs-helpers';
import type { Entries } from '@beanc16/utility-types';
import {
    type APIEmbedField,
    EmbedBuilder,
    type User,
} from 'discord.js';

export interface HangmonEmbedField extends Pick<APIEmbedField, 'name' | 'value'>
{
    success: boolean;
}

interface HangmonEmbedMessageOptions
{
    players: User[];
    fields: HangmonEmbedField[];
    attempts?: number;
    maxAttempts: number;
}

export class HangmonEmbedMessage extends EmbedBuilder
{
    private attempts: number;
    private maxAttempts: number;

    constructor({
        players,
        fields = [],
        attempts = 0,
        maxAttempts,
    }: HangmonEmbedMessageOptions)
    {
        super({
            title: 'Hangmon',
            description: `Players: ${players.map(player => Text.Ping.user(player.id)).join(', ')}`,
            fields: HangmonEmbedMessage.parseFields(fields),
            thumbnail: {
                url: players[0].displayAvatarURL(),
            },
        });

        this.attempts = attempts;
        this.maxAttempts = maxAttempts;
        this.setAttempts(attempts);
    }

    public setFields(fields: HangmonEmbedField[]): this
    {
        const parsedFields = HangmonEmbedMessage.parseFields(fields);
        super.setFields(parsedFields);
        return this;
    }

    private static parseFields(fields: HangmonEmbedField[]): APIEmbedField[]
    {
        return fields.map(({
            name,
            value,
            success,
        }) =>
        {
            const successEmoji = success ? '🟢' : '🔴';

            return {
                name: `${successEmoji} ${name}`,
                value: Text.Code.multiLine(value),
                inline: true,
            };
        });
    }

    private setAttempts(attempts: number): this
    {
        this.attempts = attempts;
        super.setFooter({
            text: `🔢 Attempts: ${this.attempts}/${this.maxAttempts}`,
        });
        return this;
    }

    public markAsLoss(pokemonName: string): this
    {
        const description = [
            `😥👎 ${this.data.description!} 😥👎`,
            `### Pokemon: ${pokemonName}`,
        ].join('\n');

        return this.setDescription(description);
    }

    public addWinStreak(userIdToWinStreak: Record<string, number>, mode: 'add' | 'set'): this
    {
        // Group users by their number of wins
        const winCountToUserIds = (Object.entries(userIdToWinStreak) as Entries<Record<string, number>>).reduce((acc, [userId, winCount]) =>
        {
            if (!acc[winCount])
            {
                acc[winCount] = [];
            }

            acc[winCount].push(userId);
            return acc;
        }, {} as Record<number, string[]>);

        // Put each win count on a separate line
        const winStreakStr = Object.entries(winCountToUserIds).reduce((acc, [winCount, userIds]) =>
        {
            const lineBreak = (acc === '') ? '' : '\n';
            const userIdPings = userIds.map(userId => Text.Ping.user(userId)).join(', ');
            const winSingularOrPlural = (winCount === '1') ? 'Win' : 'Wins';
            return `${acc}${lineBreak}🏆 ${winCount} ${winSingularOrPlural}: ${userIdPings} 🏆`;
        }, '');

        // Set the description
        // eslint-disable-next-line no-nested-ternary -- TODO: Update this later
        const description = (this.data.description!.includes('Wins'))
            ? this.data.description!
            : (mode === 'add')
                ? `${this.data.description!}\n${winStreakStr}`
                : winStreakStr;

        return this.setDescription(description);
    }

    public displayAttemptsInDescription(): this
    {
        const description = (this.data.description!.includes('Attempt'))
            ? this.data.description!
            : [
                this.data.description!,
                `### Attempt: ${this.attempts}/${this.maxAttempts}`,
            ].join('\n');

        return this.setDescription(description);
    }
}
