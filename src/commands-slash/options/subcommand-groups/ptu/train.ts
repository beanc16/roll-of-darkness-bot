export enum CharacterSheetName {
    // Magalam Present Campaign
    Yuki = 'Sano Yukihime',
    Hina = 'Hina Keawe',
    Mary = 'Mary Fantasia',

    // Eden Usurper Campaign
    Vesper = 'Vesper',
    Fanqia = 'Lú Fanqia',
    Verona = 'Verona Starlet',
    Emery = 'Emery Draven',
}

export const getSpreadsheetIdFromCharacterSheetName = (characterSheetName: CharacterSheetName) =>
{
    const characterNameToSpreadsheetId: Record<CharacterSheetName, string> = {
        [CharacterSheetName.Yuki]: '1sOwz9lMG1gF1HzDz0xUAHGQ8fD0tvembRLF1FGEMF1A',
        [CharacterSheetName.Hina]: '1uFlHgP_AngmNJ3jJ-PQFGjsyjNiBykKnf2-wDtprzWw',
        [CharacterSheetName.Mary]: '1XXoNcgPz52ovVnvLYDOa1ROBvzY1cK-3lFA2jXshOgU',
        [CharacterSheetName.Vesper]: '1vP1pgOsf-a6TykSnpJtL7RppQiK24pQZ05F2jCSTV0c',
        [CharacterSheetName.Fanqia]: '1AEtwiFKoxC85BAvgXt8TkIGrv1RGGWK25qpVzCh4qvM',
        [CharacterSheetName.Verona]: '1VUMbrsyRlHZVXeVXZ7XRgONYEzK5UUVfYP0G9SbTBrk',
        [CharacterSheetName.Emery]: '1mTn2iWj01efQnzdtz_YCV5AoM57tr5MZv-AOfcpGqZ4',
    };

    const characterNameToDiscordUserId: Record<CharacterSheetName, string[]> = {
        [CharacterSheetName.Yuki]: ['173083328302284800'],
        [CharacterSheetName.Hina]: ['173083328302284800'],
        [CharacterSheetName.Mary]: ['392769259756847116', '125738013841031170'],
        [CharacterSheetName.Vesper]: ['389188261731368962', '173083328302284800'],
        [CharacterSheetName.Fanqia]: ['125738013841031170', '173083328302284800'],
        [CharacterSheetName.Verona]: ['483775349197373460', '173083328302284800'],
        [CharacterSheetName.Emery]: ['191607823292039169', '173083328302284800'],
    };

    return {
        spreadsheetId: characterNameToSpreadsheetId[characterSheetName],
        discordUserIdsOfSpreadsheetEditors: characterNameToDiscordUserId[characterSheetName],
    };
};
