import { BaseCustomModal } from './BaseCustomModal.js';
import { combatTrackerModals } from '../commands-slash/Combat_Tracker/modals/index.js';

export const modalMap = [
    ...combatTrackerModals,
].reduce(function (acc, CurModal)
{
    acc[CurModal.id] = CurModal;
    return acc;
}, {} as Record<string, typeof BaseCustomModal | undefined>);
