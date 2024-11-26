import { characterNameToSpreadsheetInfo } from '../constants.js';
import { PtuCharacterSheetName } from '../types/sheets.js';
import { PtuSubcommandGroup } from './index.js';

export enum PtuTrainSubcommand
{
    Train = PtuSubcommandGroup.Train,
}

interface GetSpreadsheetIdFromCharacterSheetNameResponse
{
    spreadsheetId: string;
    discordUserIdsOfSpreadsheetEditors: string[];
}

export const getSpreadsheetIdFromCharacterSheetName = (characterSheetName: PtuCharacterSheetName): GetSpreadsheetIdFromCharacterSheetNameResponse =>
{
    return characterNameToSpreadsheetInfo[characterSheetName];
};
