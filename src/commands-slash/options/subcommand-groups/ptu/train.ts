export enum CharacterSheetName {
    // Magalam Present Campaign
    Yuki = 'Sano Yukihime',
    Marina = 'Marina Keawe',
    Mary = 'Mary Fantasia',
    RetPresent = 'Ret Thron (Present)',
    Morgan = 'Morgan Dyfodwg',

    // Magalam Past Campaign
    Hina = 'Hina Keawe',
    Lucy = 'Lucia Delgado',
    RetPast = 'Ret Thron (Past)',
    Yami = 'Yami Juon',

    // Eden Usurper Campaign
    Vesper = 'Vesper',
    Fanqia = 'Lú Fanqia',
    Verona = 'Verona Starlet',
    Emery = 'Emery Draven',
}

enum DiscordUserId {
    Bean = '173083328302284800',
    Avery = '389188261731368962',
    Josh = '125738013841031170',
    Cody = '483775349197373460',
    Ash = '392769259756847116',
    Joel = '191607823292039169',
}

export const getSpreadsheetIdFromCharacterSheetName = (characterSheetName: CharacterSheetName) =>
{
    const characterNameToSpreadsheetInfo: Record<CharacterSheetName, {
        spreadsheetId: string;
        discordUserIdsOfSpreadsheetEditors: string[];
    }> = {
        // Magalam Present Campaign
        [CharacterSheetName.Yuki]: {
            spreadsheetId: '1sOwz9lMG1gF1HzDz0xUAHGQ8fD0tvembRLF1FGEMF1A',
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Bean,
            ],
        },
        [CharacterSheetName.Marina]: {
            spreadsheetId: '1jsQFtZanMDqV3rve3jfva3yxzfRsGKJh4A_hhg4SKAg',
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Avery,
            ],
        },
        [CharacterSheetName.RetPresent]: {
            spreadsheetId: '1RqtG-rW19goVS98ad6YvPmC_U_7m0K72pQzKZkhWFtg',
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Cody,
            ],
        },
        [CharacterSheetName.Mary]: {
            spreadsheetId: '1XXoNcgPz52ovVnvLYDOa1ROBvzY1cK-3lFA2jXshOgU',
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Ash,
                DiscordUserId.Avery,
                DiscordUserId.Bean,
                DiscordUserId.Josh,
            ],
        },
        [CharacterSheetName.Morgan]: {
            spreadsheetId: '159jFuwyxZfnCmSwU7UR4xjHytJCU562yxA_dedbn8Bc',
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Joel,
                DiscordUserId.Avery,
                DiscordUserId.Bean,
                DiscordUserId.Josh,
            ],
        },

        // Magalam Past Campaign
        [CharacterSheetName.Hina]: {
            spreadsheetId: '1uFlHgP_AngmNJ3jJ-PQFGjsyjNiBykKnf2-wDtprzWw',
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Bean,
            ],
        },
        [CharacterSheetName.Lucy]: {
            spreadsheetId: '12l01Yks_5chRtksZqQpMrxzpxaiurQhvNMfgskk-GiM',
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Avery,
            ],
        },
        [CharacterSheetName.RetPast]: {
            spreadsheetId: '1jWpp1L8RirVFz0KqEDVMIfgukIr5E6DAhyO0_S8HSvo',
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Cody,
            ],
        },
        [CharacterSheetName.Yami]: {
            spreadsheetId: '19DX-Ebjyc2xIEcFVmDO1q09b2rsamXZP3KCrW6Kqv7w',
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Ash,
                DiscordUserId.Avery,
                DiscordUserId.Bean,
            ],
        },

        // Eden Usurper Campaign
        [CharacterSheetName.Vesper]: {
            spreadsheetId: '1vP1pgOsf-a6TykSnpJtL7RppQiK24pQZ05F2jCSTV0c',
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Avery,
                DiscordUserId.Bean,
            ],
        },
        [CharacterSheetName.Fanqia]: {
            spreadsheetId: '1AEtwiFKoxC85BAvgXt8TkIGrv1RGGWK25qpVzCh4qvM',
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Josh,
                DiscordUserId.Bean,
            ],
        },
        [CharacterSheetName.Verona]: {
            spreadsheetId: '1VUMbrsyRlHZVXeVXZ7XRgONYEzK5UUVfYP0G9SbTBrk',
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Cody,
                DiscordUserId.Bean,
            ],
        },
        [CharacterSheetName.Emery]: {
            spreadsheetId: '1mTn2iWj01efQnzdtz_YCV5AoM57tr5MZv-AOfcpGqZ4',
            discordUserIdsOfSpreadsheetEditors: [
                DiscordUserId.Joel,
                DiscordUserId.Avery,
                DiscordUserId.Bean,
            ],
        },
    };

    return characterNameToSpreadsheetInfo[characterSheetName];
};
