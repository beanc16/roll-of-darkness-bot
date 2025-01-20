import { DiscordUserId } from '../../types/discord.js';
import { PtuAbilityForDefensiveTypeEffectiveness, PtuAbilityForOffensiveTypeEffectiveness } from './types/PtuAbilityForTypeEffectiveness.js';
import { PtuCharacterSheetName, PtuSheetName } from './types/sheets.js';

export interface SpreadsheetInfo
{
    spreadsheetId: string;
    discordUserIdsOfSpreadsheetEditors: string[];
}

export interface BulkSpreadsheetInfo
{
    spreadsheetIds: string[];
    discordUserIdsOfSpreadsheetEditors: string[];
}

export const rollOfDarknessPtuSpreadsheetId = '12_3yiG7PWWnm0UZm8enUcjLd0f4i3XoZQBpkGCHfKJI';

export const characterNameToSpreadsheetInfo: Record<PtuCharacterSheetName, SpreadsheetInfo> = {
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
    [PtuCharacterSheetName.Harvey]: {
        spreadsheetId: '10HJCVVxD9o3Ebfx21n3CMLu3aR1U-X9s13nn7Etw7RY',
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

export const sheetNameToSpreadsheetInfo: Record<PtuSheetName, BulkSpreadsheetInfo> = {
    [PtuSheetName.AllEdenAdminAndBot]: {
        spreadsheetIds: [
            '1RdJg_zxDvRNuDU5jaldjvHizXahzIvLLD212NFrDqMk',
            '1DhezMK2pyDaIX_I59PL4roFod5RsrtyB4LDk_yNwBYg',
            '195kWqxSK2x3PWip0NBHFr2GvEbNGZsaVEns_dUAZ3sI',
            '1hD-_NMKd8vACsdVwAD8-GIDYIsCe74bxPW96NVxFcbY',
            rollOfDarknessPtuSpreadsheetId,
        ],
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Bean,
        ],
    },
    [PtuSheetName.AllEdenAdmin]: {
        spreadsheetIds: [
            '1RdJg_zxDvRNuDU5jaldjvHizXahzIvLLD212NFrDqMk',
            '1DhezMK2pyDaIX_I59PL4roFod5RsrtyB4LDk_yNwBYg',
            '195kWqxSK2x3PWip0NBHFr2GvEbNGZsaVEns_dUAZ3sI',
            '1hD-_NMKd8vACsdVwAD8-GIDYIsCe74bxPW96NVxFcbY',
        ],
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Bean,
        ],
    },
    [PtuSheetName.AllEdenCharacters]: {
        spreadsheetIds: [
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Vesper].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Fanqia].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Verona].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Emery].spreadsheetId,
        ],
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Bean,
        ],
    },
    [PtuSheetName.EdenNpcOnePagers]: {
        spreadsheetIds: ['1RdJg_zxDvRNuDU5jaldjvHizXahzIvLLD212NFrDqMk'],
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Bean,
        ],
    },
    [PtuSheetName.EdenWildPokemon]: {
        spreadsheetIds: ['1DhezMK2pyDaIX_I59PL4roFod5RsrtyB4LDk_yNwBYg'],
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Bean,
        ],
    },
    [PtuSheetName.EdenLegendaryPokemon]: {
        spreadsheetIds: ['195kWqxSK2x3PWip0NBHFr2GvEbNGZsaVEns_dUAZ3sI'],
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Bean,
        ],
    },
    [PtuSheetName.EdenPokedex]: {
        spreadsheetIds: ['1hD-_NMKd8vACsdVwAD8-GIDYIsCe74bxPW96NVxFcbY'],
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Bean,
        ],
    },
    [PtuSheetName.BotData]: {
        spreadsheetIds: [rollOfDarknessPtuSpreadsheetId],
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Bean,
            DiscordUserId.Josh,
        ],
    },
    [PtuSheetName.OriginSheet]: {
        spreadsheetIds: ['1xLVv3UyvwGDKLL5-Wto7PY2airkgFmX7DKHExtw2xZc'],
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Bean,
            DiscordUserId.Josh,
        ],
    },
    [PtuSheetName.AllMagalamCharacters]: {
        spreadsheetIds: [
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Yuki].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Marina].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.RetPresent].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Mary].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Morgan].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Harvey].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Hina].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Lucy].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.RetPast].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Yami].spreadsheetId,
        ],
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Bean,
            DiscordUserId.Josh,
        ],
    },
    [PtuSheetName.AllMagalamPresentCharacters]: {
        spreadsheetIds: [
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Yuki].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Marina].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.RetPresent].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Mary].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Morgan].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Harvey].spreadsheetId,
        ],
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Bean,
            DiscordUserId.Josh,
        ],
    },
    [PtuSheetName.AllMagalamPastCharacters]: {
        spreadsheetIds: [
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Hina].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Lucy].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.RetPast].spreadsheetId,
            characterNameToSpreadsheetInfo[PtuCharacterSheetName.Yami].spreadsheetId,
        ],
        discordUserIdsOfSpreadsheetEditors: [
            DiscordUserId.Bean,
            DiscordUserId.Josh,
        ],
    },
};

export const getSpreadsheetIdFromCharacterSheetName = (characterSheetName: PtuCharacterSheetName): SpreadsheetInfo =>
{
    const spreadsheetInfo = characterNameToSpreadsheetInfo[characterSheetName];
    return spreadsheetInfo;
};

export const getSpreadsheetIdFromSheetName = (sheetName: PtuCharacterSheetName | PtuSheetName): BulkSpreadsheetInfo =>
{
    const characterSheetNames = new Set(
        Object.keys(characterNameToSpreadsheetInfo) as PtuCharacterSheetName[],
    );

    if (characterSheetNames.has(sheetName as PtuCharacterSheetName))
    {
        const { spreadsheetId, discordUserIdsOfSpreadsheetEditors } = getSpreadsheetIdFromCharacterSheetName(sheetName as PtuCharacterSheetName);

        return {
            spreadsheetIds: [spreadsheetId],
            discordUserIdsOfSpreadsheetEditors,
        };
    }

    const spreadsheetInfo = sheetNameToSpreadsheetInfo[sheetName as PtuSheetName];
    return spreadsheetInfo;
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

export const abilitiesForTypeEffectivenessSet = new Set<string>([
    ...Object.values(PtuAbilityForOffensiveTypeEffectiveness),
    ...Object.values(PtuAbilityForDefensiveTypeEffectiveness),
]);
