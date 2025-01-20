import { APIApplicationCommandOptionChoice } from 'discord.js';

export enum PtuCharacterSheetName
{
    // Magalam Present Campaign
    Yuki = 'Sano Yukihime',
    Marina = 'Marina Keawe',
    Mary = 'Mary Fantasia',
    RetPresent = 'Ret Thron (Present)',
    Morgan = 'Morgan Dyfodwg',
    Harvey = 'Harvey DeLuca',

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

export const ptuCharacterSheetNameChoices = Object.values(PtuCharacterSheetName).map<APIApplicationCommandOptionChoice<string>>(
    (name) =>
    {
        return {
            name,
            value: name,
        };
    },
);

export enum PtuSheetName
{
    // Eden
    AllEdenAdminAndBot = 'Eden - All Admin Sheets and Bot Data',
    AllEdenAdmin = 'Eden - All Admin Sheets',
    AllEdenCharacters = 'Eden - All Character Sheets',
    EdenNpcOnePagers = 'Eden - NPC One Pagers',
    EdenWildPokemon = 'Eden - Wild Pokemon',
    EdenLegendaryPokemon = 'Eden - Legendary Pokemon',
    EdenPokedex = 'Eden - Pokedex',

    // General
    BotData = 'Roll of Darkness Bot Data',
    OriginSheet = 'Origin Sheet',

    // Magalam
    AllMagalamCharacters = 'Magalam - All Character Sheets',
    AllMagalamPresentCharacters = 'Magalam (Present) - All Character Sheets',
    AllMagalamPastCharacters = 'Magalam (Past) - All Character Sheets',
}

export const ptuSheetNameChoices = Object.values(PtuSheetName).map<APIApplicationCommandOptionChoice<string>>(
    (name) =>
    {
        return {
            name,
            value: name,
        };
    },
);

export enum PtuDataSheetName
{
    AbilityData = 'Ability Data',
}

export const ptuDataSheetNameChoices = Object.values(PtuDataSheetName).map<APIApplicationCommandOptionChoice<string>>(
    (name) =>
    {
        return {
            name,
            value: name,
        };
    },
);
