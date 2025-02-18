import { PtuAura } from '../../../../src/commands-slash/Ptu/models/PtuAura.js';

describe('class: PtuAura', () =>
{
    describe('constructor', () =>
    {
        it('should correctly parse name', () =>
        {
            const aura = new PtuAura(['Some Aura', 'Some Effect', 'Some Legendaries']);
            expect(aura.name).toEqual('Some Aura');
        });

        it('should correctly parse effect', () =>
        {
            const aura = new PtuAura(['Some Aura', 'Some Effect', 'Some Legendaries']);
            expect(aura.effect).toEqual('Some Effect');
        });

        // These cases assume names will always be provided, as that fits the business rules
        it.each([
            ['Includes: Names | Excludes: Group Name, Aura Name, Comment, Multiple Entries', 'Mew', {
                legendaries: ['Mew'],
                legendaryGroups: [],
            }],
            ['Includes: Names, Group Name | Excludes: Aura Name, Comment, Multiple Entries', 'Galarian Birds (Galarian Articuno, Galarian Moltres, Galarian Zapdos)', {
                legendaries: [
                    'Galarian Articuno',
                    'Galarian Moltres',
                    'Galarian Zapdos',
                ],
                legendaryGroups: ['Galarian Birds'],
            }],
            ['Includes: Names, Aura Name | Excludes: Group Name, Comment, Multiple Entries', 'Shaymin [Nature]', {
                legendaries: ['Shaymin [Nature]'],
                legendaryGroups: [],
            }],
            ['Includes: Names, Comment | Excludes: Group Name, Aura Name, Multiple Entries', 'Zamazenta {If Hiding}', {
                legendaries: ['Zamazenta (If Hiding)'],
                legendaryGroups: [],
            }],
            ['Includes: Names, Group Name, Aura Name | Excludes: Comment, Multiple Entries', 'Legendary Birds (Articuno, Moltres, Zapdos) [Ocean]', {
                legendaries: [
                    'Articuno [Ocean]',
                    'Moltres [Ocean]',
                    'Zapdos [Ocean]',
                ],
                legendaryGroups: ['Legendary Birds'],
            }],
            ['Includes: Names, Group Name, Comment | Excludes: Aura Name, Multiple Entries', 'Weather Trio (Kyogre, Groudon, Rayquaza) {If Primal}', {
                legendaries: [
                    'Kyogre (If Primal)',
                    'Groudon (If Primal)',
                    'Rayquaza (If Primal)',
                ],
                legendaryGroups: ['Weather Trio'],
            }],
            ['Includes: Names, Group Name, Aura Name, Comment | Excludes: Multiple Entries', 'Creation Trio (Dialga, Palkia, Giratina) [Space] {If Origin}', {
                legendaries: [
                    'Dialga [Space] (If Origin)',
                    'Palkia [Space] (If Origin)',
                    'Giratina [Space] (If Origin)',
                ],
                legendaryGroups: ['Creation Trio'],
            }],
            ['Includes: Names, Group Name, Aura Name, Comment, Multiple Entries', [
                'Creation Trio (Dialga, Palkia, Giratina) [Space] {If Origin}',
                'Sea Guardians (Manaphy, Phione) [Ocean] {If In Water}',
            ].join('\n'), {
                legendaries: [
                    'Dialga [Space] (If Origin)',
                    'Palkia [Space] (If Origin)',
                    'Giratina [Space] (If Origin)',
                    'Manaphy [Ocean] (If In Water)',
                    'Phione [Ocean] (If In Water)',
                ],
                legendaryGroups: ['Creation Trio', 'Sea Guardians'],
            }],
        ])('should correctly parse legendariesCsv if - %s', (_, legendariesCsv, expectedResult) =>
        {
            const aura = new PtuAura(['Some Aura', 'Some Effect', legendariesCsv]);
            expect(aura.legendaries).toEqual(expectedResult.legendaries);
            expect(aura.legendaryGroups).toEqual(expectedResult.legendaryGroups);
        });
    });
});
