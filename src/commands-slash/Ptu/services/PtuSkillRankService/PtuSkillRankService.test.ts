import { PtuSkillRank } from '../../types/types.js';
import { PtuSkillRankService } from './PtuSkillRankService.js';

describe('class: PtuSkillRankService', () =>
{
    describe('method: getDc', () =>
    {
        it.each([
            [PtuSkillRank.Pathetic, 4],
            [PtuSkillRank.Untrained, 7],
            [PtuSkillRank.Novice, 10],
            [PtuSkillRank.Adept, 13],
            [PtuSkillRank.Expert, 17],
            [PtuSkillRank.Master, 21],
            [PtuSkillRank.Virtuoso, 25],
        ])('should return the correct DC for a skill rank of "%s"', (rank: PtuSkillRank, expectedDc: number) =>
        {
            const result = PtuSkillRankService.getDc(rank);
            expect(result).toEqual(expectedDc);
        });
    });
});
