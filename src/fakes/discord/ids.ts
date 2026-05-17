import { DiceLiteService } from '../../services/Dice/DiceLiteService.js';

export const getFakeDiscordId = (): string =>
{
    // Discord user ids are 18 character numeric strings
    const rollService = new DiceLiteService({
        count: 1,
        sides: 9,
    });
    return Array.from<number, number>({ length: 18 }, () => rollService.roll()[0]).join('');
};

export const getFakeDiscordIds = (): string[] =>
{
    return Array.from<string, string>({ length: 10 }, () => getFakeDiscordId());
};
