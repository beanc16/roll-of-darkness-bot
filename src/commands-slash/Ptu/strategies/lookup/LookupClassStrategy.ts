import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import { PokemonType } from '../../types/pokemon.js';
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

    // Specialist Team Classes
    StatAce = 'Stat Ace',
    StyleExpert = 'Style Expert',
    TypeAce = 'Type Ace',
    BugAce = 'Bug Ace',
    DarkAce = 'Dark Ace',
    DragonAce = 'Dragon Ace',
    ElectricAce = 'Electric Ace',
    FairyAce = 'Fairy Ace',
    FightingAce = 'Fighting Ace',
    FireAce = 'Fire Ace',
    FlyingAce = 'Flying Ace',
    GhostAce = 'Ghost Ace',
    GrassAce = 'Grass Ace',
    GroundAce = 'Ground Ace',
    IceAce = 'Ice Ace',
    NormalAce = 'Normal Ace',
    PoisonAce = 'Poison Ace',
    PsychicAce = 'Psychic Ace',
    RockAce = 'Rock Ace',
    SteelAce = 'Steel Ace',
    WaterAce = 'Water Ace',

    // Professional Classes
    Chef = 'Chef',
    Chronicler = 'Chronicler',
    Fashionista = 'Fashionista',
    Researcher = 'Researcher',
    GeneralResearcher = 'General Researcher',
    GeneralResearcherPlaytest = 'General Researcher [Playtest]',
    ApothecaryResearcher = 'Apothecary Researcher',
    ArtificerResearcher = 'Artificer Researcher',
    BotanyResearcher = 'Botany Researcher',
    ChemistryResearcher = 'Chemistry Researcher',
    ClimatologyResearcher = 'Climatology Researcher',
    OccultismResearcher = 'Occultism Researcher',
    PaleontologyResearcher = 'Paleontology Researcher',
    PokemonCaretakingResearcher = 'Pokemon Caretaking Researcher',
    Survivalist = 'Survivalist',
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
        // Create base lists for type ace and elementalist
        const typeToFeatures: Record<PokemonType, string[]> = {
            [PokemonType.Bug]: [
                'Insectoid Utility',
                'Interactive Evolution',
                'Chitin Shield',
                'Disruption Order',
            ],
            [PokemonType.Dark]: [
                'Clever Ruse',
                'Sneak Attack',
                'Devious',
                'Black-Out Strike',
            ],
            [PokemonType.Dragon]: [
                `Tyrant's Roar`,
                'Highlander',
                'Unconquerable',
                'This Will Not Stand',
            ],
            [PokemonType.Electric]: [
                'Lockdown',
                'Overload',
                'Shocking Speed',
                'Chain Lightning',
            ],
            [PokemonType.Fairy]: [
                'Fairy Lights',
                'Arcane Favor',
                'Fey Trance',
                'Fairy Rite',
            ],
            [PokemonType.Fighting]: [
                'Close Quarters Master',
                'Brawler',
                'Face Me Whelp',
                'Smashing Punishment',
            ],
            [PokemonType.Fire]: [
                'Brightest Flame',
                'Trail Blazer',
                'Incandescence',
                'Fan the Flames',
            ],
            [PokemonType.Flying]: [
                'Celerity',
                'Gale Strike',
                'Zephyr Shield',
                'Tornado Charge',
            ],
            [PokemonType.Ghost]: [
                'Ghost Step',
                'Haunting Curse',
                'Vampirism',
                'Boo!',
            ],
            [PokemonType.Grass]: [
                'Foiling Foliage',
                'Sunlight Within',
                'Enduring Bloom',
                'Cross-Pollinate',
            ],
            [PokemonType.Ground]: [
                'Mold the Earth',
                'Desert Heart',
                'Earthroil',
                'Upheaval',
            ],
            [PokemonType.Ice]: [
                'Glacial Ice',
                'Polar Vortex',
                'Arctic Zeal',
                'Deep Cold',
            ],
            [PokemonType.Normal]: [
                'Extra Ordinary',
                'Plainly Perfect',
                'New Normal',
                'Simple Improvements',
            ],
            [PokemonType.Poison]: [
                'Potent Venom',
                'Debilitate',
                'Miasma',
                'Corrosive Blight',
            ],
            [PokemonType.Psychic]: [
                'Psionic Sponge',
                'Mindbreak',
                'Psychic Resonance',
                'Force of Will',
            ],
            [PokemonType.Rock]: [
                'Gravel Before Me',
                'Bigger and Boulder',
                'Tough as Schist',
                'Gneiss Aim',
            ],
            [PokemonType.Steel]: [
                'Polished Shine',
                'Iron Grit',
                'Assault Armor',
                'True Steel',
            ],
            [PokemonType.Water]: [
                'Flood!',
                'Fishbowl Technique',
                'Fountain of Life',
                'Aqua Vortex',
            ],
        };

        const baseTypeAceFeatures = [
            PtuClassName.TypeAce,
            'Type Refresh',
            'Move Sync',
        ];

        const typeAceFeaturesForTypes = Object.values(typeToFeatures).reduce<string[]>(
            (acc, cur) => acc.concat(cur), [],
        );

        // Create base costs for researcher branches
        const researcherBranchToFeatures: Record<string, string[]> = {
            [PtuClassName.GeneralResearcher]: [
                'Breadth of Knowledge',
                'Live and Learn',
                'Instant Analysis',
                'Echoes of the Future',
            ],
            [PtuClassName.GeneralResearcherPlaytest]: [
                'Breadth of Knowledge [Playtest]',
                'Bookworm [Playtest]',
                'Well Read [Playtest]',
                'Echoes of the Future [Playtest]',
            ],
            [PtuClassName.ApothecaryResearcher]: [
                'Apothecary',
                'Patch Cure',
                'Medical Techniques',
                'Medicinal Blend',
            ],
            [PtuClassName.ArtificerResearcher]: [
                'Crystal Artificer',
                'Crystal Resonance',
                'Rainbow Light',
                'Fistful of Force',
            ],
            [PtuClassName.BotanyResearcher]: [
                'Seed Bag',
                'Top Tier Berries',
                'Herb Lore',
            ],
            [PtuClassName.ChemistryResearcher]: [
                'Chemist',
                'Chemical Warfare',
                'Caustic Chemistry',
                'Playing God',
            ],
            [PtuClassName.ClimatologyResearcher]: [
                'Climatology',
                'Climate Control',
                'Weather Systems',
                'Extreme Weather',
            ],
            [PtuClassName.OccultismResearcher]: [
                'Witch Hunter',
                'Psionic Analysis',
                'Mental Resistance',
                'Immutable Mind',
            ],
            [PtuClassName.PaleontologyResearcher]: [
                'Fossil Restoration',
                'Ancient Heritage',
                'Genetic Memory',
                'Prehistoric Bond',
            ],
            [PtuClassName.PokemonCaretakingResearcher]: [
                'Pusher',
                `This One's Special, I Know It`,
                'Skill Trainer',
                'Re-Balancing',
            ],
        };

        const allResearcherBranchFeatures = Object.values(researcherBranchToFeatures).reduce<string[]>(
            (acc, cur) => acc.concat(cur), [],
        );

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

            // Specialist Team Classes
            [PtuClassName.StatAce]: [
                PtuClassName.StatAce,
                'Stat Link',
                'Stat Training',
                'Stat Maneuver',
                'Stat Mastery',
                'Stat Embodiment',
                'Stat Strategem',
            ],
            [PtuClassName.StyleExpert]: [
                PtuClassName.StyleExpert,
                'Style Flourish',
                'Style Entrainment',
                'Beautiful Ballet',
                'Fabulous Max',
                'Enticing Beauty',
                'Cool Conduct',
                'Rule of Cool',
                'Action Hero Stunt',
                'Cute Cuddle',
                'Gleeful Steps',
                `Let's Be Friends!`,
                'Smart Scheme',
                'Calculated Assault',
                'Learn From Your Mistakes',
                'Tough Tumble',
                'Macho Charge',
                'Endurance',
            ],
            [PtuClassName.TypeAce]: [...baseTypeAceFeatures, ...typeAceFeaturesForTypes],
            [PtuClassName.BugAce]: [...baseTypeAceFeatures, ...typeToFeatures.Bug],
            [PtuClassName.DarkAce]: [...baseTypeAceFeatures, ...typeToFeatures.Dark],
            [PtuClassName.DragonAce]: [...baseTypeAceFeatures, ...typeToFeatures.Dragon],
            [PtuClassName.ElectricAce]: [...baseTypeAceFeatures, ...typeToFeatures.Electric],
            [PtuClassName.FairyAce]: [...baseTypeAceFeatures, ...typeToFeatures.Fairy],
            [PtuClassName.FightingAce]: [...baseTypeAceFeatures, ...typeToFeatures.Fighting],
            [PtuClassName.FireAce]: [...baseTypeAceFeatures, ...typeToFeatures.Fire],
            [PtuClassName.FlyingAce]: [...baseTypeAceFeatures, ...typeToFeatures.Flying],
            [PtuClassName.GhostAce]: [...baseTypeAceFeatures, ...typeToFeatures.Ghost],
            [PtuClassName.GrassAce]: [...baseTypeAceFeatures, ...typeToFeatures.Grass],
            [PtuClassName.GroundAce]: [...baseTypeAceFeatures, ...typeToFeatures.Ground],
            [PtuClassName.IceAce]: [...baseTypeAceFeatures, ...typeToFeatures.Ice],
            [PtuClassName.NormalAce]: [...baseTypeAceFeatures, ...typeToFeatures.Normal],
            [PtuClassName.PoisonAce]: [...baseTypeAceFeatures, ...typeToFeatures.Poison],
            [PtuClassName.PsychicAce]: [...baseTypeAceFeatures, ...typeToFeatures.Psychic],
            [PtuClassName.RockAce]: [...baseTypeAceFeatures, ...typeToFeatures.Rock],
            [PtuClassName.SteelAce]: [...baseTypeAceFeatures, ...typeToFeatures.Steel],
            [PtuClassName.WaterAce]: [...baseTypeAceFeatures, ...typeToFeatures.Water],

            // Professional Classes
            [PtuClassName.Chef]: [
                PtuClassName.Chef,
                'Hits the Spot',
                'Culinary Appreciation',
                'Accentuated Taste',
                'Complex Aftertaste',
                'Dietician',
                'Dumplings',
            ],
            [PtuClassName.Chronicler]: [
                PtuClassName.Chronicler,
                'Archival Training',
                'Archive Tutor',
                'Targeted Profiling',
                'Obswervation Party',
                'Cinematic Analysis',
            ],
            [PtuClassName.Fashionista]: [
                PtuClassName.Fashionista,
                'Dashing Makeover',
                'Style is Eternal',
                'Accessorize',
                'Parfumier',
                'Versatile Wardrobe',
                'Dress to Impress',
            ],
            [PtuClassName.Researcher]: [
                PtuClassName.Researcher,
                ...allResearcherBranchFeatures,
            ],
            [PtuClassName.GeneralResearcher]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.GeneralResearcher],
            ],
            [PtuClassName.GeneralResearcherPlaytest]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.GeneralResearcherPlaytest],
            ],
            [PtuClassName.ApothecaryResearcher]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.ApothecaryResearcher],
            ],
            [PtuClassName.ArtificerResearcher]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.ArtificerResearcher],
            ],
            [PtuClassName.BotanyResearcher]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.BotanyResearcher],
            ],
            [PtuClassName.ChemistryResearcher]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.ChemistryResearcher],
            ],
            [PtuClassName.ClimatologyResearcher]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.ClimatologyResearcher],
            ],
            [PtuClassName.OccultismResearcher]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.OccultismResearcher],
            ],
            [PtuClassName.PaleontologyResearcher]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.PaleontologyResearcher],
            ],
            [PtuClassName.PokemonCaretakingResearcher]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.PokemonCaretakingResearcher],
            ],
            [PtuClassName.Survivalist]: [
                PtuClassName.Survivalist,
                'Natural Fighter',
                'Trapper',
                'Wilderness Guide',
                'Terrain Talent',
                'Adaptive Geography',
            ],
        };

        // TODO: Use features to say which features to get from LookupFeatureStrategy.getLookupData
        const features = classToFeaturesMap[input.name];

        // TODO: Make LookupFeatureStrategy.getLookupData work with multiple feature names later.
        return await LookupFeatureStrategy.getLookupData(input);
    }
}
