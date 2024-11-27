export enum CounterOperation
{
    Plus = 'added 1',
    Minus = 'subtracted 1',
}

export interface CounterAuditLog
{
    userId: string;
    operation: CounterOperation;
    timestamp: Date;
}

export interface CounterDiscordCreator
{
    userId: string;
    serverId?: string;
    channelId: string;
    messageId: string;
}
