/* eslint-disable max-classes-per-file */

export class FailedToAddUnderdogCapabilityError extends Error
{
    constructor(originalError?: unknown)
    {
        super(
            'Successfully updated stats, but failed to add Underdog capability',
            { cause: originalError },
        );
        this.name = 'FailedToAddUnderdogCapabilityError';

        Error.captureStackTrace(this, FailedToAddUnderdogCapabilityError);
    }
}

export class FailedToRemoveUnderdogCapabilityError extends Error
{
    constructor(originalError?: unknown)
    {
        super(
            'Successfully updated stats, but failed to remove Underdog capability',
            { cause: originalError },
        );
        this.name = 'FailedToRemoveUnderdogCapabilityError';

        Error.captureStackTrace(this, FailedToRemoveUnderdogCapabilityError);
    }
}
