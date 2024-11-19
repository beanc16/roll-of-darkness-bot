import { characterNameToSpreadsheetInfo } from '../constants.js';
import { PtuCharacterSheetName } from '../types/sheets.js';

export const getSpreadsheetIdFromCharacterSheetName = (characterSheetName: PtuCharacterSheetName) =>
{
    return characterNameToSpreadsheetInfo[characterSheetName];
};
