import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import { PtuFeature } from '../../types/PtuFeature.js';
import { LookupFeatureStrategy } from './LookupFeatureStrategy.js';

export interface GetLookupClassDataParameters extends BaseLookupDataOptions
{
    name: PtuClassName;
}

enum PtuClassName
{
    // Introductory Classes
    AceTrainer = 'Ace Trainer',
    CaptureSpecialist = 'Capture Specialist',
    Commander = 'Commander',
    Coordinator = 'Coordinator',
    Hobbyist = 'Hobbyist',
    Mentor = 'Mentor',

    // Battling Style Classes
    Cheerleader = 'Cheerleader',
    Duelist = 'Duelist',
    EnduringSoul = 'Enduring Soul',
    Juggler = 'Juggler',
    Rider = 'Rider',
    Taskmaster = 'Taskmaster',
    Trickster = 'Trickster',
}

@staticImplements<ChatIteractionStrategy>()
export class LookupClassStrategy
{
    // TODO: Change this key to Class later
    public static key: PtuLookupSubcommand.Feature = PtuLookupSubcommand.Feature;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.FeatureName, true) as PtuClassName;

        const data = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = LookupFeatureStrategy.getEmbedMessages(data, 'Class');

        return await LookupStrategy.run(interaction, embeds, {
            // TODO: Change PtuLookupSubcommand.Feature to PtuLookupSubcommand.Class later
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Feature}`,
            noEmbedsErrorMessage: 'No classes were found.',
        });
    }

    private static async getLookupData(input: GetLookupClassDataParameters): Promise<PtuFeature[]>
    {
        const classToFeaturesMap: Record<PtuClassName, string[]> = {
            // Introductory Classes
            [PtuClassName.AceTrainer]: [
                PtuClassName.AceTrainer,
                'Perseverance',
                'Elite Trainer',
                'Critical Moment',
                'Top Percentage',
                'Signature Technique',
                'Champ in the Making',
            ],
            [PtuClassName.CaptureSpecialist]: [
                PtuClassName.CaptureSpecialist,
                'Advanced Capture Techniques',
                'Captured Momentum',
                `Gotta Catch 'Em All`,
            ],
            [PtuClassName.Commander]: [
                PtuClassName.Commander,
                'Mobilize',
                'Leadership',
                'Battle Conductor',
                'Complex Orders',
                'Tip the Scales',
                'Scheme Twist',
            ],
            [PtuClassName.Coordinator]: [
                PtuClassName.Coordinator,
                'Decisive Director',
                'Adaptable Performance',
                'Flexible Preparations',
                'Innovation',
                'Nuanced Performance',
                'Reliance Performance',
            ],
            [PtuClassName.Hobbyist]: [
                PtuClassName.Hobbyist,
                'Dilettante',
                'Dabbler',
                'Look and Learn',
            ],
            [PtuClassName.Mentor]: [
                PtuClassName.Mentor,
                'Lessons',
                'Expand Horizons',
                'Guidance',
                'Move Tutor',
                'Egg Tutor',
                'Lifelong Learning',
            ],

            // Battling Style Classes
            [PtuClassName.Cheerleader]: [
                PtuClassName.Cheerleader,
                'Cheer Brigade',
                'Gleeful Interference',
                'Inspirational Support',
                'Moment of Action',
                'Go, Fight, Win!',
                'Keep Fighting!',
            ],
            [PtuClassName.Duelist]: [
                PtuClassName.Duelist,
                'Expend Momentum',
                'Effective Methods',
                'Directed Focus',
                'Type Methodology',
                `Duelist's Methods`,
                'Seize the Moment',
            ],
            [PtuClassName.EnduringSoul]: [
                PtuClassName.EnduringSoul,
                'Staying Power',
                'Shrug Off',
                'Awareness',
                'Resilience',
                'Not Yet!',
                'Vim and Vigor',
            ],
            [PtuClassName.Juggler]: [
                PtuClassName.Juggler,
                'Bounce Shot',
                'Juggling Show',
                'Round Trip',
                'Tag In',
                'Emergency Release',
                'First Blood',
            ],
            [PtuClassName.Rider]: [
                PtuClassName.Rider,
                'Ramming Speed',
                `Conqueror's March`,
                'Ride as One',
                'Lean In',
                `Cavalier's Reprisal`,
                'Overrun',
            ],
            [PtuClassName.Taskmaster]: [
                PtuClassName.Taskmaster,
                'Quick Healing',
                'Savage Strike',
                'Strike of the Whip',
                'Pain Resistance',
                'Press On!',
                'Desperate Strike',
                'Deadly Gambit',
            ],
            [PtuClassName.Trickster]: [
                PtuClassName.Trickster,
                'Bag of Tricks',
                'Stacked Deck',
                'Flourish',
                'Encore Performance',
                'Sleight',
            ],
        };
        const features = classToFeaturesMap[input.name];

        // TODO: Make LookupFeatureStrategy.getLookupData work with multiple feature names later.
        return await LookupFeatureStrategy.getLookupData(input);
    }
}
