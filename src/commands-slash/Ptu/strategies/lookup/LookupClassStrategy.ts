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
    ApothecaryResearcher = 'Apothecary Researcher',
    ArtificerResearcher = 'Artificer Researcher',
    BotanyResearcher = 'Botany Researcher',
    ChemistryResearcher = 'Chemistry Researcher',
    ClimatologyResearcher = 'Climatology Researcher',
    OccultismResearcher = 'Occultism Researcher',
    PaleontologyResearcher = 'Paleontology Researcher',
    PokemonCaretakingResearcher = 'Pokemon Caretaking Researcher',
    Survivalist = 'Survivalist',

    // Fighter Classes
    Athlete = 'Athlete',
    Dancer = 'Dancer',
    Hunter = 'Hunter',
    MartialArtist = 'Martial Artist',
    Musician = 'Musician',
    Provocateur = 'Provocateur',
    Rogue = 'Rogue',
    Roughneck = 'Roughneck',
    Tumbler = 'Tumbler',

    // Supernatural Classes
    AuraGuardian = 'Aura Guardian',
    Channeler = 'Channeler',
    HexManiac = 'Hex Maniac',
    Ninja = 'Ninja',
    Oracle = 'Oracle',
    Sage = 'Sage',
    Telekinetic = 'Telekinetic',
    Telepath = 'Telepath',
    Warper = 'Warper',

    // Game of Throhs Classes
    Berserker = 'Berserker',
    RuneMaster = 'Rune Master',
    Arcanist = 'Arcanist',
    Fortress = 'Fortress',
    Marksman = 'Marksman',
    Skirmisher = 'Skirmisher',
    BugElementalist = 'Bug Elementalist: Swarmlord',
    DarkElementalist = 'Dark Elementalist: Shade Caller',
    DragonElementalist = 'Dragon Elementalist: Herald of Pride',
    ElectricElementalist = 'Electric Elementalist: Spark Master',
    FairyElementalist = 'Fairy Elementalist: Glamour Weaver',
    FireElementalist = 'Fire Elementalist: Fire Bringer',
    FlyingElementalist = 'Flying Elementalist: Wind Runner',
    GhostElementalist = 'Ghost Elementalist: Apparition',
    GrassElementalist = 'Grass Elementalist: Druid',
    GroundElementalist = 'Ground Elementalist: Earth Shaker',
    IceElementalist = 'Ice Elementalist: Frost Touched',
    NormalElementalist = 'Normal Elementalist: Prism',
    PoisonElementalist = 'Poison Elementalist: Miasmic',
    RockElementalist = 'Rock Elementalist: Stone Warrior',
    SteelElementalist = 'Steel Elementalist: Steelheart',
    WaterElementalist = 'Water Elementalist: Maelstrom',

    // Do Porygon Dream of Mareep Classes
    EngineerResearcher = 'Engineer Researcher',
    JailbreakerResearcher = 'Jailbreaker Researcher',
    UpgraderResearcher = 'Upgrader Researcher',
    Glitchbender = 'Glitch Bender',

    // September 2015 Playtest Classes
    CheerleaderPlaytest = 'Cheerleader [Playtest]',
    Medic = 'Medic',

    // May 2015 Playtest Classes
    Backpacker = 'Backpacker',
    GadgeteerResearcher = 'Gadgeteer Researcher',
    GeneralResearcherPlaytest = 'General Researcher [Playtest]',
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
            [PtuClassName.EngineerResearcher]: [
                'Engineer',
                'Robofighter',
                'Overclock',
                'Experimental AI',
            ],
            [PtuClassName.JailbreakerResearcher]: [
                'Jailbreaker',
                'Poke Ball Mods',
                'Fusion Cases',
                'Case Specialist',
            ],
            [PtuClassName.UpgraderResearcher]: [
                'Upgrader',
                'Emergency Reactivation',
                'Efficient Installation',
                'Experimental Designs',
            ],
            [PtuClassName.GadgeteerResearcher]: [
                'Improvised Gadgets',
                'I Meant to Do That',
                'Capsule Science',
                'Enhanced Capsules',
            ],
            [PtuClassName.GeneralResearcherPlaytest]: [
                'Breadth of Knowledge [Playtest]',
                'Bookworm [Playtest]',
                'Well Read [Playtest]',
                'Echoes of the Future [Playtest]',
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

            // Fighter Classes
            [PtuClassName.Athlete]: [
                PtuClassName.Athlete,
                'Training Regime',
                'Coaching',
                'Adrenaline Rush',
                'Athletic Moves',
            ],
            [PtuClassName.Dancer]: [
                PtuClassName.Dancer,
                'Dance Form',
                'Beguiling Dance',
                'Dance Practice',
                'Choreographer',
                'Power Pirouette',
                'Passing Waltz',
            ],
            [PtuClassName.Hunter]: [
                PtuClassName.Hunter,
                'Pack Tactics',
                'Surprise!',
                `Hunter's Reflexes`,
                'Finisher',
                `Don't Look Away`,
                'Pack Master',
            ],
            [PtuClassName.MartialArtist]: [
                PtuClassName.MartialArtist,
                'Martial Training',
                'My Kung-Fu is Stronger',
                'Martial Achievement',
                'Second Strike',
            ],
            [PtuClassName.Musician]: [
                PtuClassName.Musician,
                'Musical Ability',
                'Mt. Moon Blues',
                'Cacophony',
                'Noise Complaint',
                'Voice Lessons',
                'Power Chord',
            ],
            [PtuClassName.Provocateur]: [
                PtuClassName.Provocateur,
                'Push Buttons',
                'Quick Wit',
                'Mixed Messages',
                'Powerful Motivator',
                'Play Them Like a Fiddle',
                'Enchanting Gaze',
            ],
            [PtuClassName.Rogue]: [
                PtuClassName.Rogue,
                'Cutthroat',
                'Dirty Fighting',
                'Unexpected Attacks',
                'Underhanded Tactics',
                'Street Fighter',
                `Scoundrel's Strike`,
            ],
            [PtuClassName.Roughneck]: [
                PtuClassName.Roughneck,
                'Menace',
                'Mettle',
                'Malice',
                'Fearsome Display',
                'Cruel Gaze',
                'Tough as Nails',
            ],
            [PtuClassName.Tumbler]: [
                PtuClassName.Tumbler,
                'Aerialist',
                'Quick Gymnastics',
                'Flip Out',
                'Death From Above',
                'Quick Reflexes',
                'Burst of Speed',
            ],

            // Supernatural Classes
            [PtuClassName.AuraGuardian]: [
                PtuClassName.AuraGuardian,
                'Aura Reader',
                'The Power of Aura',
                'Sword of Body and Soul',
                'Ambient Aura',
                'Aura Master',
            ],
            [PtuClassName.Channeler]: [
                PtuClassName.Channeler,
                'Shared Senses',
                'Battle Synchronization',
                'Spirit Boost',
                'Power Conduit',
                'Pain Dampening',
                'Soothing Connection',
            ],
            [PtuClassName.HexManiac]: [
                PtuClassName.HexManiac,
                'Hex Maniac Studies',
                'Diffuse Pain',
                'Malediction',
                'Grand Hex',
            ],
            [PtuClassName.Ninja]: [
                PtuClassName.Ninja,
                `Ninja's Arsenal`,
                'Poison Weapons',
                'Genjutsu',
                'Utility Drop',
                'Weightless Step',
                'Kinjutsu',
            ],
            [PtuClassName.Oracle]: [
                PtuClassName.Oracle,
                'Divination',
                'Unveiled Sight',
                'Small Prophecies',
                'Mark of Vision',
                'Two-Second Preview',
                'Prescience',
            ],
            [PtuClassName.Sage]: [
                PtuClassName.Sage,
                'Sacred Shield',
                'Mystic Defense',
                `Sage's Benediction`,
                'Lay on Hands',
                'Highly Responsive to Prayers',
                'Divine Wind',
            ],
            [PtuClassName.Telekinetic]: [
                PtuClassName.Telekinetic,
                'PK Alpha',
                'PK Omega',
                'Power of the Mind',
                'PK Combat',
                'Telekinetic Burst',
                'Psionic Overload',
            ],
            [PtuClassName.Telepath]: [
                PtuClassName.Telepath,
                'Honed Mind',
                'Telepathic Awareness',
                'Thought Detection',
                'Telepathic Warning',
                'Mental Assault',
                'Suggestion',
            ],
            [PtuClassName.Warper]: [
                PtuClassName.Warper,
                'Space Distortion',
                'Warping Ground',
                'Strange Energy',
                'Farcast',
                'Warped Transmission',
                'Reality Bender',
            ],

            // Game of Throhs Classes
            [PtuClassName.Berserker]: [
                PtuClassName.Berserker,
                'Power of Rage',
                'Lessins In Rage & Pain',
                'Frenzy',
                'Fight On and On',
                'Crash and Smash',
                'Push it to the Limit',
            ],
            [PtuClassName.RuneMaster]: [
                PtuClassName.RuneMaster,
                'Hidden Power',
                'Rewrite',
                'Glyph',
                'Words of Power',
                'Alarm Runes',
                'Explosive Runes',
                'Sentry Runes',
            ],
            [PtuClassName.Arcanist]: [
                PtuClassName.Arcanist,
                'Metamagic',
                'Authentic Thaumaturgy',
                'Signature Manipulations',
                'Recoup Energy',
                'Soul Investment',
            ],
            [PtuClassName.Fortress]: [
                PtuClassName.Fortress,
                'Slow or Steady',
                'Stalward Bastion',
                'Shield Bearer',
                'Wall of Iron',
                `Guardian's Punishment`,
                'Unstoppable Will',
            ],
            [PtuClassName.Marksman]: [
                PtuClassName.Marksman,
                'Aiming Down The Sights',
                'Double Shot',
                'Overwatch',
                'Clear Shot',
                'Crippling Shot',
                'Dead-Eye Shot',
            ],
            [PtuClassName.Skirmisher]: [
                PtuClassName.Skirmisher,
                'Nimble Steps',
                'Counter Stance',
                'Harrier',
                'Weapon Finesse',
                'Outmaneuver',
                'Swift Strikes',
            ],
            [PtuClassName.BugElementalist]: [
                PtuClassName.BugElementalist.split(': ')[1],
                'How To Shoot Web',
                'Broodlord',
                'Pheromone Markers',
                'Enhanced Embrace',
            ],
            [PtuClassName.DarkElementalist]: [
                PtuClassName.DarkElementalist.split(': ')[1],
                'Twisted Soul',
                'Living Shadow',
                'Sharpen Shadows',
                'Heart of Darkness',
                'World of Darkness',
                'Dark Soul',
            ],
            [PtuClassName.DragonElementalist]: [
                PtuClassName.DragonElementalist.split(': ')[1],
                'Noblesse Oblige',
                `Channel the Dragon's Spirit`,
                `Bare the Dragon's Claws`,
                `Call the Dragon's Rage`,
                `Rouse the Dragon's Blood`,
                'Sovereignty',
            ],
            [PtuClassName.ElectricElementalist]: [
                PtuClassName.ElectricElementalist.split(': ')[1],
                'Magnetize',
                'Body of Lightning',
                'Bottled Lightning',
                'Storm Wizard',
            ],
            [PtuClassName.FairyElementalist]: [
                PtuClassName.FairyElementalist.split(': ')[1],
                'Fey Law',
                'Passionato Harmony',
                'Lucky Clover Grand Finale',
                'Glamour Mastery',
                'Enchanting Transformation',
                'Magical Burst',
            ],
            [PtuClassName.FireElementalist]: [
                PtuClassName.FireElementalist.split(': ')[1],
                'Fiery Soul',
                'Firebrand',
                'Burning Passion',
                'Blazing Inferno',
                'Fire Breather',
            ],
            [PtuClassName.FlyingElementalist]: [
                PtuClassName.FlyingElementalist.split(': ')[1],
                'One With the Winds',
                'Flight',
                'Gale Speed',
                'Raging Winds',
            ],
            [PtuClassName.GhostElementalist]: [
                PtuClassName.GhostElementalist.split(': ')[1],
                'Shadow Arms',
                'Too Spooky',
                'Silent Assassin',
                'Shadow Form',
                'Phantom Menace',
                'Haunted Wounds',
            ],
            [PtuClassName.GrassElementalist]: [
                PtuClassName.GrassElementalist.split(': ')[1],
                'Green Path',
                'Overgrowth',
                `Druid's Call`,
                `Nature's Embrace`,
            ],
            [PtuClassName.GroundElementalist]: [
                PtuClassName.GroundElementalist.split(': ')[1],
                'Earthen Bond',
                `Earth Mother's Blessing`,
                'Earthshifter',
                'Ground Out',
                'Tectonic Shift',
            ],
            [PtuClassName.IceElementalist]: [
                PtuClassName.IceElementalist.split(': ')[1],
                'The Cold Never Bothered Me Anyway',
                'Glacial Defense',
                'Frozen Domain',
                'Winter is Coming',
                `Winter's Herald`,
            ],
            [PtuClassName.NormalElementalist]: [
                PtuClassName.NormalElementalist.split(': ')[1],
                'Blinding Brightness',
                'Sparkle',
                'Rainbow Surge',
                'Lucent Mirage',
                'Luminous Aura',
                'Prismatic Alignment',
            ],
            [PtuClassName.PoisonElementalist]: [
                PtuClassName.PoisonElementalist.split(': ')[1],
                'Corrupt Blood',
                'Flexible Form',
                'Vile Body',
                `Miasma's Call`,
                'Miasma Unleashed',
                'Miasmic Spray',
            ],
            [PtuClassName.RockElementalist]: [
                PtuClassName.RockElementalist.split(': ')[1],
                'Stone Stance',
                'Rock Power',
                'Shards of Stone',
                'Stone Cold Finish',
                'Stone Stance Mastery',
            ],
            [PtuClassName.SteelElementalist]: [
                PtuClassName.SteelElementalist.split(': ')[1],
                'Champion of Steel',
                'Steel Wind',
                'Reactive Armour',
                'Impenetrable',
                'Master of Arms',
                'Man of Steel',
            ],
            [PtuClassName.WaterElementalist]: [
                PtuClassName.WaterElementalist.split(': ')[1],
                `Water's Shroud`,
                'Hydro Jet',
                'Oceanic Feeling',
                'Call The Current',
            ],

            // Do Porygon Dream of Mareep Classes
            [PtuClassName.EngineerResearcher]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.EngineerResearcher],
            ],
            [PtuClassName.JailbreakerResearcher]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.JailbreakerResearcher],
            ],
            [PtuClassName.UpgraderResearcher]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.UpgraderResearcher],
            ],
            [PtuClassName.Glitchbender]: [
                PtuClassName.Glitchbender,
                'I Am Error',
                'Null Error',
                'Corrupt Reality',
                'Code Injection',
                'Glitch Shuffle',
                'Glitch Burst',
            ],

            // September 2015 Playtest Classes
            [PtuClassName.CheerleaderPlaytest]: [
                PtuClassName.CheerleaderPlaytest,
                'Moment of Action [Playtest]',
                'Cheers [Playtest]',
                'Inspiration Support [Playtest]',
                'Bring It On! [Playtest]',
                'Go, Fight, Win! [Playtest]',
                'Keep Fighting! [Playtest]',
            ],
            [PtuClassName.Medic]: [
                PtuClassName.Medic,
                'Front Line Healer',
                'Medical Techniques',
                `I'm a Docter Rank 1`,
                `I'm a Docter Rank 2`,
                'Proper Care',
                'Stay With Us!',
            ],

            // May 2015 Playtest Classes
            [PtuClassName.Backpacker]: [
                PtuClassName.Backpacker,
                'Item Mastery',
                'Equipment Savant',
                `Hero's Journey`,
            ],
            [PtuClassName.GadgeteerResearcher]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.GadgeteerResearcher],
            ],
            [PtuClassName.GeneralResearcherPlaytest]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.GeneralResearcherPlaytest],
            ],
        };

        const features = classToFeaturesMap[input.name];

        const {
            name: _,
            ...parsedInput
        } = input;

        return await LookupFeatureStrategy.getLookupData({
            ...parsedInput,
            names: features,
        });
    }
}
