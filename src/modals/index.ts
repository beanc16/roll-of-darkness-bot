import { combatTrackerModals } from '../commands-slash/Combat_Tracker/modals/index.js';
import { nwodModals } from '../commands-slash/Nwod/modals/index.js';
import { BaseCustomModal } from './BaseCustomModal.js';

export const modalMap = [
    ...combatTrackerModals,
    ...nwodModals,
].reduce((acc, CurModal) =>
{
    acc[CurModal.id] = CurModal;
    return acc;
}, {} as Record<string, typeof BaseCustomModal | undefined>);
