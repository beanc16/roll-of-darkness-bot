import { PtuSkillRank } from '../../types/types.js';

export class PtuSkillRankService
{
    public static getDc(rank: PtuSkillRank): number
    {
        const handlerMap: Record<PtuSkillRank, number> = {
            [PtuSkillRank.Pathetic]: 4,
            [PtuSkillRank.Untrained]: 7,
            [PtuSkillRank.Novice]: 10,
            [PtuSkillRank.Adept]: 13,
            [PtuSkillRank.Expert]: 17,
            [PtuSkillRank.Master]: 21,
            [PtuSkillRank.Virtuoso]: 25,
        };

        return handlerMap[rank];
    }
}
