import { BaseCustomModal } from './BaseCustomModal';
import { combatTrackerModals } from './combat-tracker/index';

export const modalMap = [
    ...combatTrackerModals,
].reduce(function (acc, CurModal)
{
    acc[CurModal.id] = CurModal;
    return acc;
}, {} as Record<string, typeof BaseCustomModal | undefined>);
