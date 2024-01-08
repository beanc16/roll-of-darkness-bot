export enum CombatTrackerStatus
{
    NotStarted = 'NOT_STARTED',
    InProgress = 'IN_PROGRESS',
    Completed = 'COMPLETED',
}

export enum CombatTrackerType
{
    All = 'All',
    Hp = 'Hp',
    Initiative = 'Initiative',
}

// 3_600_000ms === 3600secs === 60mins === 1hr
export const timeToWaitForCommandInteractions = 3_600_000;
