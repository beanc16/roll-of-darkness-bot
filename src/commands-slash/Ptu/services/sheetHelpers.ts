import { isOfEnum } from '../../../types/typeGuards.js';
import { PtuCharacterSheetName, PtuSheetName } from '../types/sheets.js';

interface GetSpreadsheetInfoResponse
{
    spreadsheetIds: string[];
    discordUserIdsOfSpreadsheetEditors: string[];
}

enum DiscordUserId {
    Bean = '173083328302284800',
    Avery = '389188261731368962',
    Josh = '125738013841031170',
    Cody = '483775349197373460',
    Ash = '392769259756847116',
    Joel = '191607823292039169',
}

const characterSheetNameToSpreadsheetId: Record<PtuCharacterSheetName, string> = {
    // Magalam Present Campaign
    [PtuCharacterSheetName.Yuki]: '1sOwz9lMG1gF1HzDz0xUAHGQ8fD0tvembRLF1FGEMF1A',
    [PtuCharacterSheetName.Marina]: '1jsQFtZanMDqV3rve3jfva3yxzfRsGKJh4A_hhg4SKAg',
    [PtuCharacterSheetName.RetPresent]: '1RqtG-rW19goVS98ad6YvPmC_U_7m0K72pQzKZkhWFtg',
    [PtuCharacterSheetName.Mary]: '1XXoNcgPz52ovVnvLYDOa1ROBvzY1cK-3lFA2jXshOgU',
    [PtuCharacterSheetName.Morgan]: '159jFuwyxZfnCmSwU7UR4xjHytJCU562yxA_dedbn8Bc',

    // Magalam Past Campaign
    [PtuCharacterSheetName.Hina]: '1uFlHgP_AngmNJ3jJ-PQFGjsyjNiBykKnf2-wDtprzWw',
    [PtuCharacterSheetName.Lucy]: '12l01Yks_5chRtksZqQpMrxzpxaiurQhvNMfgskk-GiM',
    [PtuCharacterSheetName.RetPast]: '1jWpp1L8RirVFz0KqEDVMIfgukIr5E6DAhyO0_S8HSvo',
    [PtuCharacterSheetName.Yami]: '19DX-Ebjyc2xIEcFVmDO1q09b2rsamXZP3KCrW6Kqv7w',

    // Eden Usurper Campaign
    [PtuCharacterSheetName.Vesper]: '1vP1pgOsf-a6TykSnpJtL7RppQiK24pQZ05F2jCSTV0c',
    [PtuCharacterSheetName.Fanqia]: '1AEtwiFKoxC85BAvgXt8TkIGrv1RGGWK25qpVzCh4qvM',
    [PtuCharacterSheetName.Verona]: '1VUMbrsyRlHZVXeVXZ7XRgONYEzK5UUVfYP0G9SbTBrk',
    [PtuCharacterSheetName.Emery]: '1mTn2iWj01efQnzdtz_YCV5AoM57tr5MZv-AOfcpGqZ4',
};

const ptuSheetNameToSpreadsheetId: Record<
    Exclude<PtuSheetName, PtuSheetName.AllEdenAdmin | PtuSheetName.AllEdenCharacters>,
    string
> = {
    // General
    [PtuSheetName.BotData]: '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI',
    [PtuSheetName.OriginSheet]: '1xLVv3UyvwGDKLL5-Wto7PY2airkgFmX7DKHExtw2xZc',

    // Eden
    [PtuSheetName.EdenNpcOnePagers]: '1RdJg_zxDvRNuDU5jaldjvHizXahzIvLLD212NFrDqMk',
    [PtuSheetName.EdenWildPokemon]: '1DhezMK2pyDaIX_I59PL4roFod5RsrtyB4LDk_yNwBYg',
    [PtuSheetName.EdenPokedex]: '1hD-_NMKd8vACsdVwAD8-GIDYIsCe74bxPW96NVxFcbY',
};

export const getSpreadsheetInfoFromCharacterSheetName = (characterSheetName: PtuCharacterSheetName): GetSpreadsheetInfoResponse =>
{
    const characterNameToSpreadsheetInfo: Record<PtuCharacterSheetName, GetSpreadsheetInfoResponse> = {
        // Magalam Present Campaign
        [PtuCharacterSheetName.Yuki]: {
            spreadsheetIds: [characterSheetNameToSpreadsheetId[PtuCharacterSheetName.Yuki]],
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Bean,
            ],
        },
        [PtuCharacterSheetName.Marina]: {
            spreadsheetIds: [characterSheetNameToSpreadsheetId[PtuCharacterSheetName.Marina]],
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Avery,
            ],
        },
        [PtuCharacterSheetName.RetPresent]: {
            spreadsheetIds: [characterSheetNameToSpreadsheetId[PtuCharacterSheetName.RetPresent]],
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Cody,
            ],
        },
        [PtuCharacterSheetName.Mary]: {
            spreadsheetIds: [characterSheetNameToSpreadsheetId[PtuCharacterSheetName.Mary]],
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Ash,
                DiscordUserId.Avery,
                DiscordUserId.Bean,
                DiscordUserId.Josh,
            ],
        },
        [PtuCharacterSheetName.Morgan]: {
            spreadsheetIds: [characterSheetNameToSpreadsheetId[PtuCharacterSheetName.Morgan]],
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Joel,
                DiscordUserId.Avery,
                DiscordUserId.Bean,
                DiscordUserId.Josh,
            ],
        },

        // Magalam Past Campaign
        [PtuCharacterSheetName.Hina]: {
            spreadsheetIds: [characterSheetNameToSpreadsheetId[PtuCharacterSheetName.Hina]],
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Bean,
            ],
        },
        [PtuCharacterSheetName.Lucy]: {
            spreadsheetIds: [characterSheetNameToSpreadsheetId[PtuCharacterSheetName.Lucy]],
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Avery,
            ],
        },
        [PtuCharacterSheetName.RetPast]: {
            spreadsheetIds: [characterSheetNameToSpreadsheetId[PtuCharacterSheetName.RetPast]],
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Cody,
            ],
        },
        [PtuCharacterSheetName.Yami]: {
            spreadsheetIds: [characterSheetNameToSpreadsheetId[PtuCharacterSheetName.Yami]],
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Ash,
                DiscordUserId.Avery,
                DiscordUserId.Bean,
            ],
        },

        // Eden Usurper Campaign
        [PtuCharacterSheetName.Vesper]: {
            spreadsheetIds: [characterSheetNameToSpreadsheetId[PtuCharacterSheetName.Vesper]],
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Avery,
                DiscordUserId.Bean,
            ],
        },
        [PtuCharacterSheetName.Fanqia]: {
            spreadsheetIds: [characterSheetNameToSpreadsheetId[PtuCharacterSheetName.Fanqia]],
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Josh,
                DiscordUserId.Bean,
            ],
        },
        [PtuCharacterSheetName.Verona]: {
            spreadsheetIds: [characterSheetNameToSpreadsheetId[PtuCharacterSheetName.Verona]],
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Cody,
                DiscordUserId.Bean,
            ],
        },
        [PtuCharacterSheetName.Emery]: {
            spreadsheetIds: [characterSheetNameToSpreadsheetId[PtuCharacterSheetName.Emery]],
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Joel,
                DiscordUserId.Avery,
                DiscordUserId.Bean,
            ],
        },
    };

    return characterNameToSpreadsheetInfo[characterSheetName];
};

export const getSpreadsheetInfoFromPtuSheetName = (ptuSheetName: PtuSheetName): GetSpreadsheetInfoResponse =>
{
    const characterNameToSpreadsheetInfo: Record<PtuSheetName, {
        spreadsheetIds: string[];
        discordUserIdsOfSpreadsheetEditors: string[];
    }> = {
        // General
        [PtuSheetName.BotData]: {
            spreadsheetIds: [ptuSheetNameToSpreadsheetId[PtuSheetName.BotData]],
            discordUserIdsOfSpreadsheetEditors: [DiscordUserId.Bean],
        },
        [PtuSheetName.OriginSheet]: {
            spreadsheetIds: [ptuSheetNameToSpreadsheetId[PtuSheetName.OriginSheet]],
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Bean,
                DiscordUserId.Josh,
                DiscordUserId.Avery,
            ],
        },

        // Eden
        [PtuSheetName.AllEdenAdmin]: {
            spreadsheetIds: [
                ptuSheetNameToSpreadsheetId[PtuSheetName.EdenNpcOnePagers],
                ptuSheetNameToSpreadsheetId[PtuSheetName.EdenWildPokemon],
                ptuSheetNameToSpreadsheetId[PtuSheetName.EdenPokedex],
            ],
            discordUserIdsOfSpreadsheetEditors: [DiscordUserId.Bean],
        },
        [PtuSheetName.AllEdenCharacters]: {
            spreadsheetIds: [
                characterSheetNameToSpreadsheetId[PtuCharacterSheetName.Vesper],
                characterSheetNameToSpreadsheetId[PtuCharacterSheetName.Fanqia],
                characterSheetNameToSpreadsheetId[PtuCharacterSheetName.Verona],
                characterSheetNameToSpreadsheetId[PtuCharacterSheetName.Emery],
            ],
            discordUserIdsOfSpreadsheetEditors: [DiscordUserId.Bean],
        },
        [PtuSheetName.EdenNpcOnePagers]: {
            spreadsheetIds: [ptuSheetNameToSpreadsheetId[PtuSheetName.EdenNpcOnePagers]],
            discordUserIdsOfSpreadsheetEditors: [DiscordUserId.Bean],
        },
        [PtuSheetName.EdenWildPokemon]: {
            spreadsheetIds: [ptuSheetNameToSpreadsheetId[PtuSheetName.EdenWildPokemon]],
            discordUserIdsOfSpreadsheetEditors: [DiscordUserId.Bean],
        },
        [PtuSheetName.EdenPokedex]: {
            spreadsheetIds: [ptuSheetNameToSpreadsheetId[PtuSheetName.EdenPokedex]],
            discordUserIdsOfSpreadsheetEditors: [DiscordUserId.Bean],
        },
    };

    return characterNameToSpreadsheetInfo[ptuSheetName];
};

export const getSpreadsheetInfo = (sheetName: PtuCharacterSheetName | PtuSheetName): GetSpreadsheetInfoResponse | undefined =>
{
    if (isOfEnum(PtuCharacterSheetName, sheetName))
    {
        return getSpreadsheetInfoFromCharacterSheetName(sheetName);
    }

    else if (isOfEnum(PtuSheetName, sheetName))
    {
        return getSpreadsheetInfoFromPtuSheetName(sheetName);
    }

    return undefined;
};
