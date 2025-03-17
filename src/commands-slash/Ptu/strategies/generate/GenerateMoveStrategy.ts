import { ChatInputCommandInteraction } from 'discord.js';
import { z } from 'zod';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { generateIntegerArrayAsStrings } from '../../../../services/arrayHelpers.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { PtuGenerateSubcommand } from '../../options/generate.js';
import {
    PokemonMoveCategory,
    PokemonType,
    PtuContestStatEffect,
    PtuContestStatType,
    PtuMoveFrequency,
} from '../../types/pokemon.js';
import { BaseGenerateStrategy } from './BaseGenerateStrategy.js';
// import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
// import { PokemonMoveCategory } from '../../types/pokemon.js';

@staticImplements<ChatIteractionStrategy>()
export class GenerateMoveStrategy extends BaseGenerateStrategy
{
    public static key: PtuGenerateSubcommand.Move = PtuGenerateSubcommand.Move;
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
        effects: z.string().describe('A description of the mechanical effects of the move.'),
        contestStatType: z.nativeEnum(PtuContestStatType).describe(
            'The type of contest stat the move affects during a Pokémon Contest.',
        ),
        contestStatEffect: z.nativeEnum(PtuContestStatEffect).describe('The effect the move has in Pokémon Contests.'),
    });

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const prompt = interaction.options.getString('prompt', true);
        // const moveName = interaction.options.getString(PtuAutocompleteParameterName.MoveName);
        // const type = interaction.options.getString('type') as PokemonType | null;
        // const category = interaction.options.getString('category') as PokemonMoveCategory | null;

        const response = await this.generate({
            key: this.key,
            schema: this.schema,
            systemInstructions: this.getSystemInstructions(),
            prompt,
        });

        if (response === undefined)
        {
            await interaction.editReply(
                'An unknown error occurred. Please try again.',
            );
            return true;
        }

        // Send message
        await interaction.editReply(response.jsonString);

        return true;
    }

    private static getSystemInstructions(): string
    {
        return `You are an assistant for generating custom Pokémon moves for the Pokémon Tabletop United (PTU) system. Your task is to design, balance, and refine custom moves while ensuring they fit within PTU’s mechanics and gameplay balance.

Each move should have clear attributes, including type, frequency, DB (Damage Base), accuracy, range, effect, and any additional conditions. Ensure that moves are viable, fair, and adhere to PTU’s move design principles.

# Steps

1. **Analyze Input**: Examine the given move concept, identifying its type, purpose, and intended effect.
2. **Determine Attributes**: Define the move’s type, DB if applicable, range, accuracy, frequency, and any secondary effects.
3. **Balance According to PTU Rules**: Ensure the move aligns with PTU’s damage scaling, effect balance, and move progression rules.
4. **Generate Output**: Present the move in a format that fits PTU’s standards.

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
- **Moves with high AC** should not be unnecessarily favored. The accuracy should match the move’s design and purpose, with adjustments made based on balance and context.
- **Large AoE moves** (e.g., Ranged Blast 3, Burst 2) should typically have Scene or Daily frequencies due to their expansive effect range.
- **Signature moves** are often slightly more powerful or flexible in frequency, particularly if they're designed for a Pokémon with weaker general moves.

Move frequency can be adjusted based on:
- **Conditional damage bonuses** (e.g., Hex-style moves that scale with debuffs).
- **Additional guaranteed effects** (e.g., status afflictions, debuffs).
- **Severe drawbacks** (e.g., heavy recoil damage, forced recharge after use).
- **Signature Moves** (e.g., Origin Pulse, Psycho Boost) can have higher frequency or more generous DB for thematic reasons.

## Move Identity & Originality

- **Avoid direct clones of existing moves**: Reflavoring (adjusting existing moves by changing their type and giving them a fitting name) is acceptable, but ensure the move feels distinct and fits the new context.
- **Ensure synergy**: The move should be thematically tied to the Pokémon’s type, abilities, or lore, and should complement the Pokémon's role in a team.

## Range Formatting

A CSV of keywords that describe the range of the move, specifying the distance or area the move affects:
- **"Burst X"**: Hits all legal targets surrounding the user in a radius of X.
- **"Cardinally Adjacent Targets"**: Hits all cardinally adjacent targets.
- **"Close Blast X"**: Creates an X by X square adjacent to the user and hits all legal targets within.
- **"Cone X"**: Hits all legal targets in the square immediately in front of the user and in 3m wide rows extending from that square up to X meters away.
- **"Line X"**: Creates a line X meters long starting from the user and hits all legal targets in that line.
- **"Melee, 1 Target"**: Hits one target adjacent to the user.
- **"X, Y Target"**: Hits Y targets within X meters of the user.
- **"X, Ranged Blast Y"**: Creates a Y by Y square up to X meters away from the user and hits all legal targets within.
- **"Aura"**: May be affected by certain Aura-related Abilities or effects.
- **"Blessing"**: Provides a Blessing shared by the entire team that persists until its used up, even if the original user is KO'd or switched out.
- **"Coat"**: Gives the targets a certain effect while the Coat persists and may be passed on by Baton Pass.
- **"Dash"**: Cannot be used if the user has the Stuck status effect.
- **"Domain"**: Affects an area and changes the rules of battle as specified by the Domain's effect.
- **"Double Strike"**: Uses two Attack Rolls; hitting with both does double damage, and both attacks can Critically Hit separately.
- **"Five Strike"**: Hits between one and five times and multiplies the move's Damage Base by the number of times hit.
- **"Execute"**: Automatically KOs the target if they hit.
- **"Exhaust"**: Causes the user to forfeit their Standard and Shift actions on their next turn and their trainer's Command.
- **"Friendly"**: Does not hit allies.
- **"Groundsource"**: Ignores Rough Terrain and Blocking Terrain when targeting.
- **"Hazard"**: Covers a portion of the battlefield and affects foes under certain circumstances.
- **"Healing"**: Heals targets or purifies them of status conditions.
- **"Illusion"**: May be ignored by Trainers with the Clairsentient Feature.
- **"Interrupt"**: Can be declared in the middle of another combatant's turn.
- **"Pass"**: Moves through targets in a straight line, dealing damage once per target.
- **"Push"**: Pushes the target a specified number of meters away.
- **"Reaction"**: Works like 'Interrupts' but happens after the triggering condition resolves.
- **"Priority"**: Happens before the user's turn if they haven't acted that round.
- **"Recoil"**: Deals damage to the user equal to a fraction of the damage dealt.
- **"Set-Up"**: Requires an initial action and a follow-up resolution.
- **"Shield"**: Prevents or mitigates incoming damage.
- **"Slice"**: Involves a blade attack and may interact with the Sharpness ability.
- **"Smite"**: Always deals some damage, even on a miss.
- **"Social"**: Cannot be Intercepted and ignores Substitute.
- **"Sonic"**: Ignores Substitute.
- **"Spirit Surge"**: Always activates its effect, even on a miss (if accuracy conditions are met).
- **"Trigger"**: Can only be used when a specified condition is met.
- **"Versatile"**: Can use either Attack or Special Attack for damage.
- **"Weather"**: Alters battlefield conditions based on weather.
- **"Field"**: Alters battlefield conditions based on the environment.
- **"Powder"**: Has no effect on Grass-type Pokémon.
- **"WR"**: Refers to a weapon's innate weapon range.

### Accuracy and Stat Checks

- When specifying an effect that alters stats, be specific about which stat is being modified. Avoid vague terms like "some stat" or "a random stat." Always name the stat explicitly. (e.g., "This move lowers the target's Special Defense by -1 CS on a roll of 17+.")
- The effect of lowering the stat should be tied to the accuracy roll. Use the format "on X+" where **X** is the number on the accuracy check (e.g., "on 18+" means the effect occurs if the accuracy check rolls an 18 or higher).
- If the stat change is part of the secondary effect, make it clear how significant the change is (e.g., "lowers the target's Speed by -2 CS" or "lowers the target's Attack by -1 CS").

Example of a full move effect:
- "This move lowers the target's Defense on 17+."
- "This move Flinches the target on 15+."

# Summary
Your goal is to create balanced, unique, and fun moves that enhance PTU gameplay without breaking game balance or introducing power creep. Always prioritize mechanical consistency and excitement in gameplay.`;
    }
}
