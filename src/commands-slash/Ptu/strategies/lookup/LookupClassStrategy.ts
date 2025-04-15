import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import { PokemonType } from '../../types/pokemon.js';
import { PtuFeature } from '../../types/PtuFeature.js';
import { PtuLookupIteractionStrategy } from '../../types/strategies.js';
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
    AttackAce = 'Attack Ace',
    DefenseAce = 'Defense Ace',
    SpecialAttackAce = 'Special Attack Ace',
    SpecialDefenseAce = 'Special Defense Ace',
    SpeedAce = 'Speed Ace',
    StyleExpert = 'Style Expert',
    BeautyExpert = 'Beauty Expert',
    CoolExpert = 'Cool Expert',
    CuteExpert = 'Cute Expert',
    SmartExpert = 'Smart Expert',
    ToughExpert = 'Tough Expert',
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

    // Homebrew Book of Divines & Divine Homebrew
    Signer = 'Signer',
    Messiah = 'Messiah',
    Branded = 'Branded',
    Usurper = 'Usurper',
    Inquisitor = 'Inquisitor',
    Scion = 'Scion',
    Cultist = 'Cultist',
    Scorned = 'Scorned',
    Disciple = 'Disciple',
}

@staticImplements<PtuLookupIteractionStrategy>()
export class LookupClassStrategy
{
    public static key: PtuLookupSubcommand.Class = PtuLookupSubcommand.Class;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.ClassName, true) as PtuClassName;

        const data = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const messageTitle = (!(
            PtuClassName.Signer === name
            || PtuClassName.Messiah === name
            || PtuClassName.Branded === name
            || PtuClassName.Usurper === name
            || PtuClassName.Inquisitor === name
            || PtuClassName.Scion === name
            || PtuClassName.Cultist === name
            || PtuClassName.Scorned === name
            || PtuClassName.Disciple === name
        ))
            ? 'Class'
            : 'Class-Adjacent';

        const embeds = LookupFeatureStrategy.getEmbedMessages(data, messageTitle);

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Class}`,
            noEmbedsErrorMessage: 'No classes were found.',
        });
    }

    public static async getLookupData(input: GetLookupClassDataParameters): Promise<PtuFeature[]>
    {
        // For autocomplete
        if (input?.name === undefined)
        {
            const classNames = Object.values(PtuClassName);

            const classFeatures = await LookupFeatureStrategy.getLookupData({
                names: classNames,
                sortByName: true,
            });

            return [
                ...classFeatures,
                ...classNames.reduce<PtuFeature[]>((acc, cur) =>
                {
                    if (
                        // All researcher classes don't have their own feature, but we want them to show up in autocomplete
                        (cur.includes('Researcher') && cur !== PtuClassName.Researcher)
                        // All elementalist classes don't say "<Type> Elementalist", but we want to include that
                        || cur.includes('Elementalist')
                    )
                    {
                        acc.push(new PtuFeature([cur]));
                    }

                    return acc;
                }, []),
            ];
        }

        // Create base lists for type ace and elementalist
        const typeToFeatures: Record<PokemonType, string[]> = {
            [PokemonType.Bug]: [
                'Insectoid Utility',
                'Iterative Evolution',
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
                'Close Quarters Mastery',
                'Brawler',
                'Face Me Whelp',
                'Smashing Punishment',
            ],
            [PokemonType.Fire]: [
                'Brightest Flame',
                'Trail Blazer',
                'Incandescence',
                'Fan The Flames',
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

        const typeAceFeaturesForTypes = Object.values(typeToFeatures).reduce<string[]>(
            (acc, cur) => acc.concat(cur), [],
        );

        // Create base lists for researcher branches
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
                'Seed Bag Rank 1',
                'Seed Bag Rank 2',
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

        // Create base lists for style expert branches
        const styleExpertBranchToFeatures: Record<string, string[]> = {
            [PtuClassName.BeautyExpert]: [
                'Beautiful Ballet Rank 1',
                'Beautiful Ballet Rank 2',
                'Fabulous Max',
                'Enticing Beauty',
            ],
            [PtuClassName.CoolExpert]: [
                'Cool Conduct Rank 1',
                'Cool Conduct Rank 2',
                'Rule of Cool',
                'Action Hero Stunt',
            ],
            [PtuClassName.CuteExpert]: [
                'Cute Cuddle Rank 1',
                'Cute Cuddle Rank 2',
                'Gleeful Steps',
                `Let's Be Friends!`,
            ],
            [PtuClassName.SmartExpert]: [
                'Smart Scheme Rank 1',
                'Smart Scheme Rank 2',
                'Calculated Assault',
                'Learn From Your Mistakes',
            ],
            [PtuClassName.ToughExpert]: [
                'Tough Tumble Rank 1',
                'Tough Tumble Rank 2',
                'Macho Charge',
                'Endurance',
            ],
        };

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
                'Advanced Capture Techniques Rank 1',
                'Advanced Capture Techniques Rank 2',
                'Advanced Capture Techniques Rank 3',
                'Advanced Capture Techniques Rank 4',
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
                'Reliable Performance',
            ],
            [PtuClassName.Hobbyist]: [
                PtuClassName.Hobbyist,
                'Dilettante Rank 1',
                'Dilettante Rank 2',
                'Dilettante Rank 3',
                'Dilettante Rank 4',
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
                `Duelist's Manual`,
                'Seize The Moment',
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
                'Bag of Tricks Rank 1',
                'Bag of Tricks Rank 2',
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
                'Stat Stratagem',
            ],
            [PtuClassName.AttackAce]: [
                PtuClassName.AttackAce,
                'Attack Link',
                'Attack Training',
                'Attack Maneuver',
                'Attack Mastery',
                'Attack Embodiment',
                'Attack Stratagem',
            ],
            [PtuClassName.DefenseAce]: [
                PtuClassName.DefenseAce,
                'Defense Link',
                'Defense Training',
                'Defense Maneuver',
                'Defense Mastery',
                'Defense Embodiment',
                'Defense Stratagem',
            ],
            [PtuClassName.SpecialAttackAce]: [
                PtuClassName.SpecialAttackAce,
                'Special Attack Link',
                'Special Attack Training',
                'Special Attack Maneuver',
                'Special Attack Mastery',
                'Special Attack Embodiment',
                'Special Attack Stratagem',
            ],
            [PtuClassName.SpecialDefenseAce]: [
                PtuClassName.SpecialDefenseAce,
                'Special Defense Link',
                'Special Defense Training',
                'Special Defense Maneuver',
                'Special Defense Mastery',
                'Special Defense Embodiment',
                'Special Defense Stratagem',
            ],
            [PtuClassName.SpeedAce]: [
                PtuClassName.SpeedAce,
                'Speed Link',
                'Speed Training',
                'Speed Maneuver',
                'Speed Mastery',
                'Speed Embodiment',
                'Speed Stratagem',
            ],
            [PtuClassName.StyleExpert]: [
                PtuClassName.StyleExpert,
                'Style Flourish',
                'Style Entrainment',
                ...styleExpertBranchToFeatures[PtuClassName.BeautyExpert],
                ...styleExpertBranchToFeatures[PtuClassName.CoolExpert],
                ...styleExpertBranchToFeatures[PtuClassName.CuteExpert],
                ...styleExpertBranchToFeatures[PtuClassName.SmartExpert],
                ...styleExpertBranchToFeatures[PtuClassName.ToughExpert],
            ],
            [PtuClassName.BeautyExpert]: [
                PtuClassName.BeautyExpert,
                'Beauty Flourish',
                'Beauty Entrainment',
                ...styleExpertBranchToFeatures[PtuClassName.BeautyExpert],
            ],
            [PtuClassName.CoolExpert]: [
                PtuClassName.CoolExpert,
                'Cool Flourish',
                'Cool Entrainment',
                ...styleExpertBranchToFeatures[PtuClassName.CoolExpert],
            ],
            [PtuClassName.CuteExpert]: [
                PtuClassName.CuteExpert,
                'Cute Flourish',
                'Cute Entrainment',
                ...styleExpertBranchToFeatures[PtuClassName.CuteExpert],
            ],
            [PtuClassName.SmartExpert]: [
                PtuClassName.SmartExpert,
                'Smart Flourish',
                'Smart Entrainment',
                ...styleExpertBranchToFeatures[PtuClassName.SmartExpert],
            ],
            [PtuClassName.ToughExpert]: [
                PtuClassName.ToughExpert,
                'Tough Flourish',
                'Tough Entrainment',
                ...styleExpertBranchToFeatures[PtuClassName.ToughExpert],
            ],
            [PtuClassName.TypeAce]: [
                PtuClassName.TypeAce,
                'Type Refresh',
                'Move Sync',
                ...typeAceFeaturesForTypes,
            ],
            [PtuClassName.BugAce]: [
                PtuClassName.BugAce,
                'Bug Refresh',
                'Move Sync',
                ...typeToFeatures.Bug,
            ],
            [PtuClassName.DarkAce]: [
                PtuClassName.DarkAce,
                'Dark Refresh',
                'Move Sync',
                ...typeToFeatures.Dark,
            ],
            [PtuClassName.DragonAce]: [
                PtuClassName.DragonAce,
                'Dragon Refresh',
                'Move Sync',
                ...typeToFeatures.Dragon,
            ],
            [PtuClassName.ElectricAce]: [
                PtuClassName.ElectricAce,
                'Electric Refresh',
                'Move Sync',
                ...typeToFeatures.Electric,
            ],
            [PtuClassName.FairyAce]: [
                PtuClassName.FairyAce,
                'Fairy Refresh',
                'Move Sync',
                ...typeToFeatures.Fairy,
            ],
            [PtuClassName.FightingAce]: [
                PtuClassName.FightingAce,
                'Fighting Refresh',
                'Move Sync',
                ...typeToFeatures.Fighting,
            ],
            [PtuClassName.FireAce]: [
                PtuClassName.FireAce,
                'Fire Refresh',
                'Move Sync',
                ...typeToFeatures.Fire,
            ],
            [PtuClassName.FlyingAce]: [
                PtuClassName.FlyingAce,
                'Flying Refresh',
                'Move Sync',
                ...typeToFeatures.Flying,
            ],
            [PtuClassName.GhostAce]: [
                PtuClassName.GhostAce,
                'Ghost Refresh',
                'Move Sync',
                ...typeToFeatures.Ghost,
            ],
            [PtuClassName.GrassAce]: [
                PtuClassName.GrassAce,
                'Grass Refresh',
                'Move Sync',
                ...typeToFeatures.Grass,
            ],
            [PtuClassName.GroundAce]: [
                PtuClassName.GroundAce,
                'Ground Refresh',
                'Move Sync',
                ...typeToFeatures.Ground,
            ],
            [PtuClassName.IceAce]: [
                PtuClassName.IceAce,
                'Ice Refresh',
                'Move Sync',
                ...typeToFeatures.Ice,
            ],
            [PtuClassName.NormalAce]: [
                PtuClassName.NormalAce,
                'Normal Refresh',
                'Move Sync',
                ...typeToFeatures.Normal,
            ],
            [PtuClassName.PoisonAce]: [
                PtuClassName.PoisonAce,
                'Poison Refresh',
                'Move Sync',
                ...typeToFeatures.Poison,
            ],
            [PtuClassName.PsychicAce]: [
                PtuClassName.PsychicAce,
                'Psychic Refresh',
                'Move Sync',
                ...typeToFeatures.Psychic,
            ],
            [PtuClassName.RockAce]: [
                PtuClassName.RockAce,
                'Rock Refresh',
                'Move Sync',
                ...typeToFeatures.Rock,
            ],
            [PtuClassName.SteelAce]: [
                PtuClassName.SteelAce,
                'Steel Refresh',
                'Move Sync',
                ...typeToFeatures.Steel,
            ],
            [PtuClassName.WaterAce]: [
                PtuClassName.WaterAce,
                'Water Refresh',
                'Move Sync',
                ...typeToFeatures.Water,
            ],

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
                'Archival Training Rank 1',
                'Archival Training Rank 2',
                'Archive Tutor',
                'Targeted Profiling',
                'Observation Party',
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
                'Terrain Talent Rank 1',
                'Terrain Talent Rank 2',
                'Adaptive Geography',
            ],

            // Fighter Classes
            [PtuClassName.Athlete]: [
                PtuClassName.Athlete,
                'Training Regime',
                'Coaching',
                'Adrenaline Rush',
                'Athletic Moves Rank 1',
                'Athletic Moves Rank 2',
                'Athletic Moves Rank 3',
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
                'Martial Training Rank 1',
                'Martial Training Rank 2',
                'Martial Training Rank 3',
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
                'The Power of Aura Rank 1',
                'The Power of Aura Rank 2',
                'Sword of Body and Soul',
                'Ambient Aura',
                'Aura Mastery',
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
                'Hex Maniac Studies Rank 1',
                'Hex Maniac Studies Rank 2',
                'Hex Maniac Studies Rank 3',
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
                'Lessons In Rage & Pain',
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
                'Signature Manipulations Rank 1',
                'Signature Manipulations Rank 2',
                'Recoup Energy',
                'Soul Investment',
            ],
            [PtuClassName.Fortress]: [
                PtuClassName.Fortress,
                'Slow or Steady',
                'Stalwart Bastion',
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
                ...this.convertFeatureNames([PtuClassName.BugElementalist]),
                'How To Shoot Web',
                'Broodlord',
                'Pheromone Markers',
                'Enhanced Embrace Rank 1',
                'Enhanced Embrace Rank 2',
                'Enhanced Embrace Rank 3',
            ],
            [PtuClassName.DarkElementalist]: [
                ...this.convertFeatureNames([PtuClassName.DarkElementalist]),
                'Twisted Soul',
                'Living Shadow',
                'Sharpen Shadows',
                'Heart of Darkness',
                'World of Darkness',
                'Dark Soul',
            ],
            [PtuClassName.DragonElementalist]: [
                ...this.convertFeatureNames([PtuClassName.DragonElementalist]),
                'Noblesse Oblige',
                `Channel the Dragon's Spirit`,
                `Bare the Dragon's Claws`,
                `Call the Dragon's Rage`,
                `Rouse the Dragon's Blood`,
                'Sovereignty',
            ],
            [PtuClassName.ElectricElementalist]: [
                ...this.convertFeatureNames([PtuClassName.ElectricElementalist]),
                'Magnetize',
                'Body of Lightning',
                'Bottled Lightning',
                'Storm Wizard Rank 1',
                'Storm Wizard Rank 2',
                'Storm Wizard Rank 3',
            ],
            [PtuClassName.FairyElementalist]: [
                ...this.convertFeatureNames([PtuClassName.FairyElementalist]),
                'Fey Law',
                'Passionato Harmony',
                'Lucky Clover Grand Finale',
                'Glamour Mastery',
                'Enchanting Transformation',
                'Magical Burst',
            ],
            [PtuClassName.FireElementalist]: [
                ...this.convertFeatureNames([PtuClassName.FireElementalist]),
                'Fiery Soul',
                'Firebrand',
                'Burning Passion',
                'Blazing Inferno',
                'Fire Breather Rank 1',
                'Fire Breather Rank 2',
            ],
            [PtuClassName.FlyingElementalist]: [
                ...this.convertFeatureNames([PtuClassName.FlyingElementalist]),
                'One With the Winds',
                'Flight',
                'Gale Speed',
                'Raging Winds Rank 1',
                'Raging Winds Rank 2',
                'Raging Winds Rank 3',
            ],
            [PtuClassName.GhostElementalist]: [
                ...this.convertFeatureNames([PtuClassName.GhostElementalist]),
                'Shadow Arms',
                'Too Spooky',
                'Silent Assassin',
                'Shadow Form',
                'Phantom Menace',
                'Haunted Wounds',
            ],
            [PtuClassName.GrassElementalist]: [
                ...this.convertFeatureNames([PtuClassName.GrassElementalist]),
                'Green Path',
                'Overgrowth',
                `Druid's Call`,
                `Nature's Embrace Rank 1`,
                `Nature's Embrace Rank 2`,
                `Nature's Embrace Rank 3`,
            ],
            [PtuClassName.GroundElementalist]: [
                ...this.convertFeatureNames([PtuClassName.GroundElementalist]),
                'Earthen Bond',
                `Earth Mother's Blessing Rank 1`,
                `Earth Mother's Blessing Rank 2`,
                'Earthshifter',
                'Ground Out',
                'Tectonic Shift',
            ],
            [PtuClassName.IceElementalist]: [
                ...this.convertFeatureNames([PtuClassName.IceElementalist]),
                'The Cold Never Bothered Me Anyway',
                'Glacial Defense',
                'Frozen Domain',
                'Winter is Coming',
                `Winter's Herald Rank 1`,
                `Winter's Herald Rank 2`,
            ],
            [PtuClassName.NormalElementalist]: [
                ...this.convertFeatureNames([PtuClassName.NormalElementalist]),
                'Blinding Brightness',
                'Sparkle',
                'Rainbow Surge',
                'Lucent Mirage',
                'Luminous Aura',
                'Prismatic Alignment',
            ],
            [PtuClassName.PoisonElementalist]: [
                ...this.convertFeatureNames([PtuClassName.PoisonElementalist]),
                'Corrupt Blood',
                'Flexible Form',
                'Vile Body',
                `Miasma's Call`,
                'Miasma Unleashed',
                'Miasmic Spray',
            ],
            [PtuClassName.RockElementalist]: [
                ...this.convertFeatureNames([PtuClassName.RockElementalist]),
                'Stone Stance',
                'Rock Power Rank 1',
                'Rock Power Rank 2',
                'Shards of Stone',
                'Stone Cold Finish',
                'Stone Stance Mastery',
            ],
            [PtuClassName.SteelElementalist]: [
                ...this.convertFeatureNames([PtuClassName.SteelElementalist]),
                'Champion of Steel',
                'Steel Wind',
                'Reactive Armour',
                'Impenetrable',
                'Master of Arms',
                'Man of Steel',
            ],
            [PtuClassName.WaterElementalist]: [
                ...this.convertFeatureNames([PtuClassName.WaterElementalist]),
                `Water's Shroud`,
                'Hydro Jet',
                'Oceanic Feeling',
                'Call the Current Rank 1',
                'Call the Current Rank 2',
                'Call the Current Rank 3',
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
                'Inspirational Support [Playtest]',
                'Bring It On! [Playtest]',
                'Go, Fight, Win! [Playtest]',
                'Keep Fighting! [Playtest]',
            ],
            [PtuClassName.Medic]: [
                PtuClassName.Medic,
                'Front Line Healer',
                'Medical Techniques',
                `I'm A Doctor Rank 1`,
                `I'm A Doctor Rank 2`,
                'Proper Care',
                'Stay With Us!',
            ],

            // May 2015 Playtest Classes
            [PtuClassName.Backpacker]: [
                PtuClassName.Backpacker,
                'Item Mastery',
                'Equipment Savant',
                `Hero's Journey Rank 1`,
                `Hero's Journey Rank 2`,
                `Hero's Journey Rank 3`,
                `Hero's Journey Rank 4`,
            ],
            [PtuClassName.GadgeteerResearcher]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.GadgeteerResearcher],
            ],
            [PtuClassName.GeneralResearcherPlaytest]: [
                PtuClassName.Researcher,
                ...researcherBranchToFeatures[PtuClassName.GeneralResearcherPlaytest],
            ],

            // Homebrew Book of Divines & Divine Homebrew
            [PtuClassName.Signer]: [
                PtuClassName.Signer,
                'Sign Mastery Rank 1',
                'Sign Mastery Rank 2',
                'Sign Mastery Rank 3',
                'Sign Mastery Rank 4',
            ],
            [PtuClassName.Messiah]: [
                PtuClassName.Messiah,
                'In My Name Rank 1',
                'In My Name Rank 2',
                'In My Name Rank 3',
                'In My Name Rank 4',
            ],
            [PtuClassName.Branded]: [
                PtuClassName.Branded,
            ],
            [PtuClassName.Usurper]: [
                PtuClassName.Usurper,
                'Shared Strengths Rank 1',
                'Shared Strengths Rank 2',
                'Shared Strengths Rank 3',
                'True Power',
                'Gift of Power',
            ],
            [PtuClassName.Inquisitor]: [
                PtuClassName.Inquisitor,
                'Punish the Heretics',
                'Disallow Divinity',
                'Deicide',
            ],
            [PtuClassName.Scion]: [
                PtuClassName.Scion,
                'Heavenly Resiliency',
                'Voice of Elements',
            ],
            [PtuClassName.Cultist]: [
                PtuClassName.Cultist,
                `Red Iron's Tithe Rank 1`,
                `Red Iron's Tithe Rank 2`,
                `Red Iron's Tithe Rank 3`,
                'Visceral Aspect',
                'Essence of Divinity',
            ],
            [PtuClassName.Scorned]: [
                PtuClassName.Scorned,
            ],
            [PtuClassName.Disciple]: [
                PtuClassName.Disciple,
            ],
        };

        const featureNames = this.convertFeatureNames(classToFeaturesMap[input.name]);

        const {
            name: _,
            ...parsedInput
        } = input;

        const features = await LookupFeatureStrategy.getLookupData({
            ...parsedInput,
            names: featureNames,
            sortByName: false,
        });

        // Sort the returned features into the input order
        const featureNameToFeature = features.reduce<Record<string, PtuFeature>>((acc, feature) =>
        {
            acc[feature.name] = feature;
            return acc;
        }, {});

        return featureNames.reduce<PtuFeature[]>((acc, featureName) =>
        {
            const feature = featureNameToFeature[featureName];

            if (feature)
            {
                acc.push(feature);
            }

            return acc;
        }, []);
    }

    private static convertFeatureNames(names: string[]): string[]
    {
        return names.map(name =>
        {
            if (name.includes('Elementalist'))
            {
                return name.split(': ')[1];
            }

            return name;
        });
    }
}
