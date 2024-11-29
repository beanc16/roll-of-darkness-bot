import { DiscordUserId } from '../../types/discord.js';
import { PtuCharacterSheetName } from './types/sheets.js';

export const rollOfDarknessPtuSpreadsheetId = '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI';

export const characterNameToSpreadsheetInfo: Record<PtuCharacterSheetName, {
    spreadsheetId: string;
    discordUserIdsOfSpreadsheetEditors: string[];
}> = {
    // Magalam Present Campaign
    [PtuCharacterSheetName.Yuki]: {
        spreadsheetId: '1sOwz9lMG1gF1HzDz0xUAHGQ8fD0tvembRLF1FGEMF1A',
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Bean,
        ],
    },
    [PtuCharacterSheetName.Marina]: {
        spreadsheetId: '1jsQFtZanMDqV3rve3jfva3yxzfRsGKJh4A_hhg4SKAg',
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Avery,
        ],
    },
    [PtuCharacterSheetName.RetPresent]: {
        spreadsheetId: '1RqtG-rW19goVS98ad6YvPmC_U_7m0K72pQzKZkhWFtg',
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Cody,
        ],
    },
    [PtuCharacterSheetName.Mary]: {
        spreadsheetId: '1XXoNcgPz52ovVnvLYDOa1ROBvzY1cK-3lFA2jXshOgU',
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Ash,
            DiscordUserId.Avery,
            DiscordUserId.Bean,
            DiscordUserId.Josh,
        ],
    },
    [PtuCharacterSheetName.Morgan]: {
        spreadsheetId: '159jFuwyxZfnCmSwU7UR4xjHytJCU562yxA_dedbn8Bc',
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Joel,
            DiscordUserId.Avery,
            DiscordUserId.Bean,
            DiscordUserId.Josh,
        ],
    },

    // Magalam Past Campaign
    [PtuCharacterSheetName.Hina]: {
        spreadsheetId: '1uFlHgP_AngmNJ3jJ-PQFGjsyjNiBykKnf2-wDtprzWw',
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Bean,
        ],
    },
    [PtuCharacterSheetName.Lucy]: {
        spreadsheetId: '12l01Yks_5chRtksZqQpMrxzpxaiurQhvNMfgskk-GiM',
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Avery,
        ],
    },
    [PtuCharacterSheetName.RetPast]: {
        spreadsheetId: '1jWpp1L8RirVFz0KqEDVMIfgukIr5E6DAhyO0_S8HSvo',
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Cody,
        ],
    },
    [PtuCharacterSheetName.Yami]: {
        spreadsheetId: '19DX-Ebjyc2xIEcFVmDO1q09b2rsamXZP3KCrW6Kqv7w',
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Ash,
            DiscordUserId.Avery,
            DiscordUserId.Bean,
        ],
    },

    // Eden Usurper Campaign
    [PtuCharacterSheetName.Vesper]: {
        spreadsheetId: '1vP1pgOsf-a6TykSnpJtL7RppQiK24pQZ05F2jCSTV0c',
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Avery,
            DiscordUserId.Bean,
        ],
    },
    [PtuCharacterSheetName.Fanqia]: {
        spreadsheetId: '1AEtwiFKoxC85BAvgXt8TkIGrv1RGGWK25qpVzCh4qvM',
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Josh,
            DiscordUserId.Bean,
        ],
    },
    [PtuCharacterSheetName.Verona]: {
        spreadsheetId: '1VUMbrsyRlHZVXeVXZ7XRgONYEzK5UUVfYP0G9SbTBrk',
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Cody,
            DiscordUserId.Bean,
        ],
    },
    [PtuCharacterSheetName.Emery]: {
        spreadsheetId: '1mTn2iWj01efQnzdtz_YCV5AoM57tr5MZv-AOfcpGqZ4',
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Joel,
            DiscordUserId.Avery,
            DiscordUserId.Bean,
        ],
    },
};

export const spreadsheetIdToCharacterSheetInfo = Object.entries(characterNameToSpreadsheetInfo).reduce<Record<string, {
    characterSheetName: PtuCharacterSheetName;
    discordUserIdsOfSpreadsheetEditors: string[];
}>>((acc, [key, value]) =>
{
    const { discordUserIdsOfSpreadsheetEditors, spreadsheetId } = value;

    acc[spreadsheetId] = {
        characterSheetName: key as PtuCharacterSheetName,
        discordUserIdsOfSpreadsheetEditors,
    };

    return acc;
}, {});

export const characterSheetSpreadsheetIds = Object.keys(spreadsheetIdToCharacterSheetInfo);
