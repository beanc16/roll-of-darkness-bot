import { FakemonSkillsEditStringSelectElementOptions } from '../../components/fakemon/actionRowBuilders/FakemonSkillsEditStringSelectActionRowBuilder.js';
import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';

export class FakemonSkillManagerService
{
    public static getSkillKey(skillToEdit: FakemonSkillsEditStringSelectElementOptions): keyof PtuFakemonCollection['skills']
    {
        switch (skillToEdit)
        {
            case FakemonSkillsEditStringSelectElementOptions.Athletics:
                return 'athletics';
            case FakemonSkillsEditStringSelectElementOptions.Acrobatics:
                return 'acrobatics';
            case FakemonSkillsEditStringSelectElementOptions.Combat:
                return 'combat';
            case FakemonSkillsEditStringSelectElementOptions.Stealth:
                return 'stealth';
            case FakemonSkillsEditStringSelectElementOptions.Perception:
                return 'perception';
            case FakemonSkillsEditStringSelectElementOptions.Focus:
                return 'focus';
            default:
                const typeCheck: never = skillToEdit;
                throw new Error(`Unhandled skillToEdit: ${typeCheck}`);
        }
    }

    public static getSkillDiceAndModifier(
        messageId: string,
        skillToEdit: FakemonSkillsEditStringSelectElementOptions,
    ): { skillDice: number; skillModifier: number }
    {
        const fakemon = PtuFakemonPseudoCache.getByMessageId(messageId);
        if (!fakemon)
        {
            throw new Error('Fakemon not found');
        }

        const skill = this.getSkillKey(skillToEdit);
        const skillString = fakemon.skills[skill];

        return this.deconstructSkillString(skillString);
    }

    public static async setSkill({
        messageId,
        fakemon,
        skillToEdit,
        skillDice,
        skillModifier,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        skillToEdit: FakemonSkillsEditStringSelectElementOptions;
        skillDice: number;
        skillModifier: number;
    }): Promise<PtuFakemonCollection>
    {
        if (skillDice < 1)
        {
            throw new Error('Skill dice cannot be less than 1');
        }
        else if (skillDice > 6)
        {
            throw new Error('Skill dice cannot be greater than 6');
        }
        else if (skillModifier < -6)
        {
            throw new Error('Skill modifier cannot be less than -6');
        }
        else if (skillModifier > 6)
        {
            throw new Error('Skill modifier cannot be greater than 6');
        }

        // Update fakemon
        const skill = this.getSkillKey(skillToEdit);
        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            skills: {
                ...fakemon.skills,
                [skill]: this.formatSkill({ skillDice, skillModifier }),
            },
        });
    }

    private static formatSkill({ skillDice, skillModifier }: { skillDice: number; skillModifier: number }): string
    {
        const skillModifierWithSign = this.addSignToSkillModifier(skillModifier);
        return `${skillDice}d6${skillModifierWithSign}`;
    }

    public static deconstructSkillString(skill: string): { skillDice: number; skillModifier: number }
    {
        const match = skill.match(/(\d+)d6(\+|-)(\d+)/);
        if (!match)
        {
            throw new Error('Invalid skill string');
        }

        const [_1, skillDiceStr, sign, skillModifierStr] = match;

        const skillDice = parseInt(skillDiceStr, 10);
        const skillModifier = parseInt(skillModifierStr, 10) * (sign === '+' ? 1 : -1);
        return { skillDice, skillModifier };
    }

    public static addSignToSkillModifier(skillModifier: number): string
    {
        const sign = skillModifier >= 0 ? '+' : '';
        return `${sign}${skillModifier}`;
    }
}
