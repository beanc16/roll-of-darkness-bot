import { combatTrackerModals } from '../commands-slash/Combat_Tracker/modals/index.js';
import { CalculateHedgeDicepoolModal } from '../commands-slash/Nwod/modals/CalculateHedgeDicepoolModal.js';
import { BaseCustomModal } from './BaseCustomModal.js';

export const modalMap = [
    ...combatTrackerModals,
    CalculateHedgeDicepoolModal,
].reduce((acc, CurModal) =>
{
    acc[CurModal.id] = CurModal;
    return acc;
}, {} as Record<string, typeof BaseCustomModal | undefined>);
