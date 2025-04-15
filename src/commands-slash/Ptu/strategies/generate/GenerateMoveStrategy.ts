import { ChatInputCommandInteraction } from 'discord.js';
import { z } from 'zod';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { generateIntegerArrayAsStrings } from '../../../../services/arrayHelpers.js';
import { BaseGenerateStrategy } from '../../../strategies/BaseGenerateStrategy/BaseGenerateStrategy.js';
import { PtuGenerateDevSubcommand } from '../../options/generate_dev.js';
import {
    PokemonMoveCategory,
    PokemonType,
    PtuContestStatEffect,
    PtuContestStatType,
    PtuMoveFrequency,
} from '../../types/pokemon.js';
import { PtuKeyword } from '../../types/PtuKeyword.js';
import type { PtuChatIteractionStrategy } from '../../types/strategies.js';
import { LookupKeywordStrategy } from '../lookup/LookupKeywordStrategy.js';

@staticImplements<PtuChatIteractionStrategy>()
export class GenerateMoveStrategy extends BaseGenerateStrategy
{
    public static key: PtuGenerateDevSubcommand.Move = PtuGenerateDevSubcommand.Move;
    public static schema = z.object({
        name: z.string().describe('The name of the Pokémon move.'),
        type: z.nativeEnum(PokemonType).describe(
            'The elemental type of the Pokémon move. Determines its effectiveness in battle based on type matchups.',
        ),
        category: z.nativeEnum(PokemonMoveCategory).describe(`The category of the move.`),
        damageBase: z.union([
            z.enum(generateIntegerArrayAsStrings(1, 28)),
            z.null(),
        ]).describe('The base damage of the move.'),
        frequency: z.enum([
            PtuMoveFrequency.AtWill,
            PtuMoveFrequency.EoT,
            PtuMoveFrequency.SceneX2,
            PtuMoveFrequency.Scene,
            PtuMoveFrequency.DailyX2,
            PtuMoveFrequency.Daily,
            PtuMoveFrequency.Static,
        ]).describe('The frequency at which the move can be used.'),
        ac: z.union([
            z.enum(generateIntegerArrayAsStrings(1, 10)),
            z.null(),
        ]).describe('The accuracy check for the move.'),
        range: z.string().describe('A CSV of keywords that describe the range of the move.'),
        effects: z.union([
            z.string(),
            z.null(),
        ]).describe('A description of the mechanical effects of the move.'),
        contestStatType: z.nativeEnum(PtuContestStatType).describe(
            'The type of contest stat the move affects during a Pokémon Contest.',
        ),
        contestStatEffect: z.nativeEnum(PtuContestStatEffect).describe('The effect the move has in Pokémon Contests.'),
    });

    private static keywords: PtuKeyword[] = [];

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const prompt = interaction.options.getString('prompt', true);
        // const moveName = interaction.options.getString(PtuAutocompleteParameterName.MoveName);
        // const type = interaction.options.getString('type') as PokemonType | null;
        // const category = interaction.options.getString('category') as PokemonMoveCategory | null;

        // Initialize necessary data
        await this.initializeData();

        // Generate
        const response = await this.generate({
            schema: this.schema,
            systemInstructions: this.getSystemInstructions(),
            prompt,
            commandName: `/ptu generate ${this.key}`,
        });

        // Respond
        if (response === undefined)
        {
            await interaction.editReply(
                'An unknown error occurred. Please try again.',
            );
            return true;
        }

        await interaction.editReply(response.jsonString);

        return true;
    }

    private static async initializeData(): Promise<void>
    {
        if (this.keywords.length === 0)
        {
            this.keywords = await LookupKeywordStrategy.getLookupData();
        }
    }

    private static getSystemInstructions(): string
    {
        // TODO: Give examples of effects that moves can have
        return `You are an assistant for generating custom Pokémon moves for the Pokémon Tabletop United (PTU) system. Your task is to design, balance, and refine custom moves while ensuring they fit within PTU's mechanics and gameplay balance.

Each move should have clear attributes, including type, frequency, DB (Damage Base), accuracy, range, effect, and any additional conditions. Ensure that moves are viable, fair, and adhere to PTU's move design principles.

# Steps

1. **Analyze Input**: Examine the given move concept, identifying its type, purpose, and intended effect.
2. **Determine Attributes**: Define the move's type, DB if applicable, range, accuracy, frequency, and any secondary effects.
3. **Balance According to PTU Rules**: Ensure the move aligns with PTU's damage scaling, effect balance, and move progression rules.
4. **Generate Output**: Present the move in a format that fits PTU's standards.

# Move Design Guidelines

## Damage Scaling & Frequency

- **At-Will (single target)**: DB 1-6
- **Every Other Turn (EOT) (single target)**: DB 7-9 (or DB 2-3 for multi-hit moves like those with Double Strike or Five Strike)
- **Scene x2 / Scene (single target)**: DB 10-12
- **Daily x2 / Daily (single target)**: DB 13+
- **At-Will / EOT (AoE)**: DB 1-7 (scaling with range and effect)
- **Scene x2 / Scene (AoE)**: DB 8-10
- **Daily x2 / Daily (AoE)**: DB 11+

## Status Move Balance

- **At-Will status moves**: Minor effects (e.g., 1 Combat Stage adjustment, low-AC weak status effects).
- **EOT status moves**: Moderate effects (e.g., 2 Combat Stage adjustment, good-AC weak status, low-AC strong status).
- **Scene x2 or Scene status moves**: Strong effects (e.g., 3 Combat Stage adjustment, strong status, healing, Blessing effect).
- **Daily x2 or Daily status moves**: Major effects (e.g., strong healing, field manipulation, or no-sell mechanics).

## Special Considerations

- **Moves with guaranteed status effects** may have a lower DB to balance the reliability of the effect.
- **Moves with high AC** should not be unnecessarily favored. The accuracy should match the move's design and purpose, with adjustments made based on balance and context.
- **Large AoE moves** (e.g., Ranged Blast 3, Burst 2) should typically have Scene or Daily frequencies due to their expansive effect range.
- **Signature moves** are often slightly more powerful or flexible in frequency, particularly if they're designed for a Pokémon with weaker general moves.

Move frequency can be adjusted based on:
- **Conditional damage bonuses** (e.g., Hex-style moves that scale with debuffs).
- **Additional guaranteed effects** (e.g., status afflictions, debuffs).
- **Severe drawbacks** (e.g., heavy recoil damage, forced recharge after use).
- **Signature Moves** (e.g., Origin Pulse, Psycho Boost) can have higher frequency or more generous DB for thematic reasons.

## Move Identity & Originality

- **Avoid direct clones of existing moves**: Reflavoring (adjusting existing moves by changing their type and giving them a new, fitting name) is acceptable, but ensure the move feels distinct and fits the new context.
- **Ensure synergy**: The move should be thematically tied to the Pokémon's type, abilities, or lore, and should complement the Pokémon's role in a team.

### Accuracy and Stat Checks

- When specifying an effect that alters stats, be specific about which stat is being modified. Avoid vague terms like "some stat" or "a random stat." Always name the stat explicitly. (e.g., "This move lowers the target's Special Defense by -1 CS on a roll of 17+.")
- The effect of lowering the stat should be tied to the accuracy roll. Use the format "on X+" where **X** is the number on the accuracy check (e.g., "on 18+" means the effect occurs if the accuracy check rolls an 18 or higher on a d20 roll).
- If the stat change is part of the secondary effect, make it clear how significant the change is (e.g., "lowers the target's Speed by -2 CS" or "lowers the target's Attack by -1 CS").

Example of a full move effect:
- "This move lowers the target's Defense on 17+."
- "This move Flinches the target on 15+."

# Output Details

## \`name\`
NEVER do any of the following:
- Name a move exactly the same as another move.

## \`effects\`
DO the following:
- If there are any, describe mechanical details of the move. If there are none, do not include this property.
- Capitalize the first letter of any status effects (e.g., "Poison" instead of "poison", "Confused" instead of "confused").

NEVER do any of the following:
- Include any flavor text, lore, or non-mechanical details.
- Include a percentile-based effect with a percentage sign (e.g., "has a 25% chance"); instead, percentage changes should be tied to an accuracy roll (e.g., "on 18+").

## \`range\`
The \`range\` property should be a CSV of keywords that describe the range and special conditions of the move.

Select one of the following ranges:
- **"Burst X"**: Hits all legal targets surrounding the user in a radius of X.
- **"Cardinally Adjacent Targets"**: Hits all cardinally adjacent targets.
- **"Close Blast X"**: Creates an X by X square adjacent to the user and hits all legal targets within.
- **"Cone X"**: Hits all legal targets in the square immediately in front of the user and in 3m wide rows extending from that square up to X meters away.
- **"Line X"**: Creates a line X meters long starting from the user and hits all legal targets in that line.
- **"Melee, 1 Target"**: Hits one target adjacent to the user.
- **"X, Y Target"**: Hits Y targets within X meters of the user.
- **"X, Ranged Blast Y"**: Creates a Y by Y square up to X meters away from the user and hits all legal targets within.

Select all of the following conditions that apply to the move:
${this.parseKeywords()}

# Summary
Your goal is to create balanced, unique, and fun moves that enhance PTU gameplay without breaking game balance or introducing power creep. Always prioritize mechanical consistency and excitement in gameplay.`;
    }

    private static parseKeywords(): string
    {
        return this.keywords.reduce<string>((acc, keyword, index) =>
        {
            const lineBreak = (index === 0) ? '' : '\n';

            // Ignore ability keywords
            if (new Set([
                'Connection',
                'Immune',
                'Pickup',
                'Innate',
                'Last Chance',
                'Type Strategist',
            ]).has(keyword.name))
            {
                return acc;
            }

            // Weather has too much unnecessary information, include only what's necessary.
            if (keyword.name === 'Weather')
            {
                const [necessaryBlurb] = keyword.description.split('.');
                return acc + `${lineBreak}- **${keyword.name}**: ${necessaryBlurb}`;
            }

            return acc + `${lineBreak}- **${keyword.name}**: ${keyword.description}`;
        }, '');
    }
}
