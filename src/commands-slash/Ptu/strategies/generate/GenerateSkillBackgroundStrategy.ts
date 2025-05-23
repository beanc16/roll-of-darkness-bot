import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';
import { z } from 'zod';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { BaseGenerateStrategy } from '../../../strategies/BaseGenerateStrategy/BaseGenerateStrategy.js';
import { PtuGenerateSubcommand } from '../../options/generate.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuSkill } from '../../types/pokemonTrainers.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';

@staticImplements<PtuChatIteractionStrategy>()
export class GenerateSkillBackgroundStrategy extends BaseGenerateStrategy
{
    public static key: PtuGenerateSubcommand.SkillBackground = PtuGenerateSubcommand.SkillBackground;
    public static schema = z.object({
        skillBackgrounds: z.array(
            z.string().describe('A skill background.'),
        ).describe('A list of 10 skill backgrounds.'),
    });

    private static validSkills = Object.values(PtuSkill).reduce<PtuSkill[]>((acc, cur) =>
    {
        // Don't include education rolls as valid random skills to roll
        if (![
            PtuSkill.GeneralEducation,
            PtuSkill.MedicineEducation,
            PtuSkill.OccultEducation,
            PtuSkill.PokemonEducation,
            PtuSkill.TechnologyEducation,
        ].includes(cur))
        {
            acc.push(cur);
        }
        return acc;
    }, []);

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        const { raisedSkills, loweredSkills } = this.getSkills(interaction);
        const prompt = this.getPrompt(interaction, raisedSkills, loweredSkills);

        // Generate
        const response = await this.generate({
            schema: this.schema,
            systemInstructions: this.getSystemInstructions(),
            prompt,
            commandName: `/ptu ${PtuSubcommandGroup.Generate} ${this.key}`,
        });

        // Respond
        if (response === undefined)
        {
            await interaction.editReply(
                'An unknown error occurred. Please try again.',
            );
            return true;
        }

        const responseString = this.getResponseString({
            raisedSkills,
            loweredSkills,
            skillBackgrounds: response.raw.skillBackgrounds,
        });
        await interaction.editReply(responseString);

        /* TODO: Uncomment once chat history is added
        await this.handlePaginatedChatResponses({
            Modal: GenerateSkillBackgroundModal,
            originalInteraction: interaction,
            embeds: [
                this.getEmbed({ title: 'Skill Backgrounds', description: responseString }),
            ],
            commandName: `/ptu ${PtuSubcommandGroup.Generate} ${this.key}`,
            generateResponseCallback: async (newPrompt) =>
            {
                const newResponse = await this.generate({
                    schema: this.schema,
                    systemInstructions: this.getSystemInstructions(),
                    prompt: newPrompt,
                    commandName: `/ptu ${PtuSubcommandGroup.Generate} ${this.key}`,
                });

                return this.getResponseString(newResponse?.raw ?? { skillBackgrounds: [] });
            },
        });
        */

        return true;
    }

    private static getPrompt(
        interaction: ChatInputCommandInteraction,
        raisedSkills: string[],
        loweredSkills: string[],
    ): string
    {
        // Get parameter results
        const pokemonSpecies = interaction.options.getString('pokemon_species', true);
        const significance = interaction.options.getString('significance');
        const lore = interaction.options.getString('lore');

        // Create lines of prompt
        const lines = [
            Text.bold(`Pokemon Species: ${pokemonSpecies}`),
            Text.bold(`Raised Skills: ${raisedSkills.join(', ')}`),
            Text.bold(`Lowered Skills: ${loweredSkills.join(', ')}`),
        ];

        if (significance)
        {
            lines.push(Text.bold(`Significance: ${significance}`));
        }

        if (lore)
        {
            lines.push(Text.bold(`Lore: ${lore}`));
        }

        return lines.join('\n');
    }

    private static getSkills(interaction: ChatInputCommandInteraction): { raisedSkills: string[]; loweredSkills: string[] }
    {
        // Get parameter results
        const raisedSkill1 = interaction.options.getString('raised_skill_1');
        const raisedSkill2 = interaction.options.getString('raised_skill_2');
        const raisedSkill3 = interaction.options.getString('raised_skill_3');
        const loweredSkill1 = interaction.options.getString('lowered_skill_1');
        const loweredSkill2 = interaction.options.getString('lowered_skill_2');
        const loweredSkill3 = interaction.options.getString('lowered_skill_3');

        // Convert skills to arrays
        const raisedSkills = [
            ...(raisedSkill1 ? [raisedSkill1] : []),
            ...(raisedSkill2 ? [raisedSkill2] : []),
            ...(raisedSkill3 ? [raisedSkill3] : []),
        ];
        const loweredSkills = [
            ...(loweredSkill1 ? [loweredSkill1] : []),
            ...(loweredSkill2 ? [loweredSkill2] : []),
            ...(loweredSkill3 ? [loweredSkill3] : []),
        ];

        // Ensure that there's alway at least 2 raised and lowered skills
        // based on input or randomly generated.
        const numOfRandomRaisedSkills = Math.max(2 - raisedSkills.length, 0);
        const numOfRandomLoweredSkills = Math.max(2 - loweredSkills.length, 0);

        for (let index = 0; index < numOfRandomRaisedSkills; index += 1)
        {
            const [rollResult] = new DiceLiteService({
                count: 1,
                sides: this.validSkills.length,
            }).roll();

            raisedSkills.push(this.validSkills[rollResult - 1]);
        }

        for (let index = 0; index < numOfRandomLoweredSkills; index += 1)
        {
            const [rollResult] = new DiceLiteService({
                count: 1,
                sides: this.validSkills.length,
            }).roll();

            loweredSkills.push(this.validSkills[rollResult - 1]);
        }

        return { raisedSkills, loweredSkills };
    }

    /* istanbul ignore next */
    private static getSystemInstructions(): string
    {
        return `You are an assistant specializing in crafting skill backgrounds for Pokemon Tabletop United.

When crafting a skill background, you follow the following rules unless explicitly requested:
- There should always be **exactly 10 skill backgrounds**.
- Skill background should be **65 characters or less**.
- Skill background should be **unique**.
- Skill background should **describe a Pokemon's life experiences**.
- Skill background should **hint at how the Pokemon behaves in everyday life**.
- Skill background should pull as much inspiration from its raised and lowered skills as it can, without using the exact skills themselves in the skill background.
- Skill background **does not contradict raised or lowered skills**.

Examples:
- Result: "Lone Sacrificial Scout"
  - Pokemon Species: Unown
  - Raised Skills: Perception, Stealth
  - Lowered Skills: Survival, Charm
  - Significance: Evokes feelings sympathy over hardship
- Result: "Impatient Cold-Blooded Leader of Assassins"
  - Pokemon Species: Edenian Gengar (ice/ghost Gengar)
  - Raised Skills: Stealth, Intimidate, Command
  - Lowered Skills: Charm, Survival, Focus
  - Significance: States that they are a leader of assassins and evokes a sense of being short-tempered
- Result: "Aloof but Confident Hat-Wearer that Takes Herself Way too Seriously"
  - Pokemon Species: Hatenna
  - Raised Skills: Intimidate, Survival
  - Lowered Skills: Stealth, Intuition
  - Significance: Feels light-hearted and low-intelligence, but lovable
- Result: "Prissy Mouse that Likes Being Pampered & Demands the Finest Haircare"
  - Pokemon Species: Minccino
  - Raised Skills: Command, Charm
  - Lowered Skills: Stealth, Survival
  - Significance: Evokes feelings of being spoiled
- Result: "Sassy All-Star Ballhog that Wants to be the Star Player on the Team"
  - Pokemon Species: Edenian Meowth (fighting type tribal Meowth)
  - Raised Skills: Athletics, Acrobatics
  - Lowered Skills: Charm, Stealth
  - Significance: Sounds like a sassy ballhog soccer player
- Result: "Fae-Hunting Sword Rodent"
  - Pokemon Species: Edenian Sentret (steel typed Sentret with a sword tail)
  - Raised Skills: Combat, Intimidate
  - Lowered Skills: Stealth, Charm
  - Significance: Sounds as though they hunt fairy types and have a sword tail
- Result: "Calm & Casual Berry-Loving Kleptomaniac"
  - Pokemon Species: Alolan Sandshrew
  - Raised Skills: Stealth, Guile
  - Lowered Skills: Intimidate, Charm
  - Significance: Sounds like a sneaky thief that loves berries
- Result: "Bullied Tundra Baby that Acts Tough to Survive (from Lyra & Sigrid Hale)"
  - Pokemon Species: Frigibax
  - Raised Skills: Intimidate, Combat
  - Lowered Skills: Charm, Command
  - Lore: Was bullied; came from a tundra; was given by Lyra and Sigrid Hale
- Result: "Emotionally Resilient Songbird with Formerly Abandoned Hope"
  - Pokemon Species: Edenian Chatot (fairy/flying Chatot)
  - Raised Skills: Charm, Survival
  - Lowered Skills: Intimidate, Intuition
  - Lore: Was abandoned and now has a hope for a better future
- Result: "Timid Alolan Fox that Finds Comfort in Cuddles & Comfy Clothes"
  - Pokemon Species: Alolan Vulpix
  - Raised Skills: Charm, Intuition
  - Lowered Skills: Intimidate, Guile
  - Lore: Is snuggly and likes wearing comfy clothes
- Result: "Lonely bully that lashes out for attention"
  - Pokemon Species: Meowin (custom ice/rock type cat/lion pokemon)
  - Raised Skills: Combat, Intimidate
  - Lowered Skills: Charm, Intuition
  - Significance: Sounds like a bully. Justify that they are a bully.
- Result: "Overconfident Cat that's Definitely in Charge"
  - Pokemon Species: Edenian Glameow (ice/ground type Glameow)
  - Raised Skills: Command, Intimidate
  - Lowered Skills: Intuition, Charm
  - Significance: Sounds like a cocky cat. Worded to be tongue-in-cheek.
- Result: "Sneaky Opera Singer & Theater Kid"
  - Pokemon Species: Spiritina (custom ghost/fairy type pokemon)
  - Raised Skills: Command, Stealth
  - Lowered Skills: Intuition, Acrobatics
  - Lore: Likes singing opera and performing. Give a term that makes them sound eccentric.
- Result: "Braindead Tanky Blubber Lover"
  - Pokemon Species: Cetoddle
  - Raised Skills: Combat, Athletics
  - Lowered Skills: Stealth, Focus
  - Significance: Phrased in a goofy way, make them sound unintelligent and tanky based on traits of a Cetoddle.
- Result: "Snuggly blob that just wants some hugs"
  - Pokemon Species: Slugmy (custom fusion of Slugma and Goomy)
  - Raised Skills: Charm, Intuition
  - Lowered Skills: Intimidate, Stealth
  - Significance: Sounds snuggly. Worded to be tongue-in-cheek, since it's fiery and snuggling it would hurt.`;
    }

    private static getResponseString({
        raisedSkills,
        loweredSkills,
        skillBackgrounds = [],
    }: {
        raisedSkills: string[];
        loweredSkills: string[];
        skillBackgrounds: string[];
    }): string
    {
        const skillBackgroundsOutput = skillBackgrounds.reduce((acc, skillBackground, index) =>
        {
            const lineBreak = (index === 0) ? '' : '\n';

            return acc + `${lineBreak}${index + 1}. ${skillBackground}`;
        }, '');

        const raisedSkillsOutput = raisedSkills.reduce((acc, cur, index) =>
        {
            const lineBreak = (index === 0) ? '' : '\n';
            return acc + `${lineBreak}- ${cur}`;
        }, '');

        const loweredSkillsOutput = loweredSkills.reduce((acc, cur, index) =>
        {
            const lineBreak = (index === 0) ? '' : '\n';
            return acc + `${lineBreak}- ${cur}`;
        }, '');

        return [
            Text.bold('Skill Backgrounds:'),
            skillBackgroundsOutput,
            '',
            Text.bold('Raised Skills:'),
            raisedSkillsOutput,
            '',
            Text.bold('Lowered Skills:'),
            loweredSkillsOutput,
        ].join('\n');
    }
}
