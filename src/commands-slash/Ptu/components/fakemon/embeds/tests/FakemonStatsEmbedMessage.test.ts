/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
// ^ the above are giving a lot of false negatives for some reason, temporarily disabling

import { FakemonStatsEmbedMessage } from '../FakemonStatsEmbedMessage';

describe('class: FakemonStatsEmbedMessage', () =>
{
    const input: ConstructorParameters<typeof FakemonStatsEmbedMessage>[0] = {
        baseStats: {
            hp: 1,
            attack: 2,
            defense: 3,
            specialAttack: 4,
            specialDefense: 5,
            speed: 6,
        },
    };

    describe('constructor', () =>
    {
        it('should construct', () =>
        {
            const embedMessage = new FakemonStatsEmbedMessage(input);
            expect(embedMessage).toBeDefined();
        });
    });

    describe('method: constructDescriptionLines', () =>
    {
        it('should construct description lines', () =>
        {
            const descriptionLines = FakemonStatsEmbedMessage.constructDescriptionLines(input);
            expect(descriptionLines).toEqual([
                'HP: 1',
                'Attack: 2',
                'Defense: 3',
                'Special Attack: 4',
                'Special Defense: 5',
                'Speed: 6',
                'Total: 21',
            ]);
        });
    });
});
