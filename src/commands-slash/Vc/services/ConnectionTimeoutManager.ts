import { getVoiceConnection } from '@discordjs/voice';

export class ConnectionTimeoutManager
{
    private static guildIdToTimestamp = new Map<string, Date>();
    private static intervalTimeout: NodeJS.Timeout | undefined = undefined;
    private static connectionCheckFrequency = 60_000; // 1 minute
    private static validConnectionDuration = 300_000; // 5 minutes

    private static get hasNoConnections(): boolean
    {
        return this.guildIdToTimestamp.size === 0;
    }

    private static get hasInterval(): boolean
    {
        return !!this.intervalTimeout;
    }

    public static get(guildId: string): Date | undefined
    {
        return this.guildIdToTimestamp.get(guildId);
    }

    public static upsert(guildId: string): void
    {
        this.guildIdToTimestamp.set(guildId, new Date());
        this.trySetInterval();
    }

    public static delete(guildIds: string | string[]): void
    {
        // Delete guildId(s)
        if (Array.isArray(guildIds))
        {
            guildIds.forEach((guildId) => this.delete(guildId));
        }
        else
        {
            this.guildIdToTimestamp.delete(guildIds);
        }

        this.tryEndInterval();
    }

    private static trySetInterval(): void
    {
        if (this.hasInterval || this.hasNoConnections)
        {
            return;
        }

        this.intervalTimeout = setInterval(() =>
        {
            const guildIdsToDelete: string[] = [];

            this.guildIdToTimestamp.forEach((timestamp, guildId) =>
            {
                // Delete connections that have been inactive for more than the allowed time
                if (Date.now() - timestamp.getTime() >= this.validConnectionDuration)
                {
                    // Disconnect from voice channel if it exists
                    const connection = getVoiceConnection(guildId);
                    if (connection)
                    {
                        connection.destroy();
                    }

                    // Stage guildId for deletion
                    guildIdsToDelete.push(guildId);
                }
            });

            // Delete guildIds
            this.delete(guildIdsToDelete);
            this.tryEndInterval();
        }, this.connectionCheckFrequency);
    }

    private static tryEndInterval(): void
    {
        if (this.hasInterval && this.hasNoConnections)
        {
            clearInterval(this.intervalTimeout);
            this.intervalTimeout = undefined;
        }
    }
}
