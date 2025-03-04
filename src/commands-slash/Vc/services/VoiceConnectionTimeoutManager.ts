import {
    AudioPlayerStatus,
    getVoiceConnection,
    type VoiceConnectionReadyState,
} from '@discordjs/voice';

export class VoiceConnectionTimeoutManager
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

    public static upsert(guildId: string, shouldTryEndInterval = true): void
    {
        this.guildIdToTimestamp.set(guildId, new Date());
        this.trySetInterval(shouldTryEndInterval);
    }

    public static delete(guildIds: string | string[], shouldTryEndInterval = true): void
    {
        // Delete guildId(s)
        if (Array.isArray(guildIds))
        {
            guildIds.forEach((guildId) => this.guildIdToTimestamp.delete(guildId));
        }
        else
        {
            this.guildIdToTimestamp.delete(guildIds);
        }

        if (shouldTryEndInterval)
        {
            this.tryEndInterval();
        }
    }

    private static destroyConnection(guildId: string, shouldTryEndInterval = true): boolean
    {
        let result = true;
        const connection = getVoiceConnection(guildId);
        if (connection)
        {
            const state = connection.state as VoiceConnectionReadyState | undefined;

            if (state && state.subscription && state.subscription.player)
            {
                const { player } = state.subscription;

                // Update timestamp if audio is still playing, as that means the connection is still active
                if (player.state.status === AudioPlayerStatus.Playing)
                {
                    this.upsert(guildId, shouldTryEndInterval);
                    return false;
                }
            }

            connection.destroy();
        }
        else
        {
            result = false;
        }

        if (shouldTryEndInterval)
        {
            this.tryEndInterval();
        }

        return result;
    }

    public static destroyAllConnections(): void
    {
        this.guildIdToTimestamp.forEach((_timestamp, guildId) =>
        {
            this.destroyConnection(guildId);
        });
    }

    private static trySetInterval(shouldTryEndInterval = true): void
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
                    const wasDestroyed = this.destroyConnection(guildId, false);

                    // Stage guildId for deletion
                    if (wasDestroyed)
                    {
                        guildIdsToDelete.push(guildId);
                    }
                }
            });

            // Delete guildIds
            this.delete(guildIdsToDelete, shouldTryEndInterval);

            if (shouldTryEndInterval)
            {
                this.tryEndInterval();
            }
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
