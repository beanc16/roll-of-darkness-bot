export enum CombatTrackerStatus
{
    NotStarted = 'NOT_STARTED',
    InProgress = 'IN_PROGRESS',
    Completed = 'COMPLETED',
    NotStartedOrInProgress = 'NOT_STARTED_OR_IN_PROGRESS',
    InProgressOrCompleted = 'IN_PROGRESS_OR_COMPLETED',
    NotStartedOrCompleted = 'NOT_STARTED_OR_COMPLETED',
    All = 'ALL',
}

export enum CombatTrackerType
{
    All = 'All',
    Hp = 'Hp',
    Initiative = 'Initiative',
}

// 3_600_000ms === 3600secs === 60mins === 1hr
export const timeToWaitForCommandInteractions = 3_600_000;
