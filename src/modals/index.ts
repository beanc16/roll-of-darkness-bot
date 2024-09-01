import { BaseCustomModal } from './BaseCustomModal.js';
import { combatTrackerModals } from './combat-tracker/index.js';

export const modalMap = [
    ...combatTrackerModals,
].reduce(function (acc, CurModal)
{
    acc[CurModal.id] = CurModal;
    return acc;
}, {} as Record<string, typeof BaseCustomModal | undefined>);
