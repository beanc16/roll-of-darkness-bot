export enum PtuAbilityForOffensiveTypeEffectiveness
{
    Scrappy = 'Scrappy',
    TintedLens = 'Tinted Lens',
}

export enum PtuAbilityForDefensiveTypeEffectiveness
{
    CaveCrasher = 'Cave Crasher',
    MudDweller = 'Mud Dweller',
    DrySkin = 'Dry Skin',
    WaterAbsorb = 'Water Absorb',
    StormDrain = 'Storm Drain',
    StormDrainErrata = 'Storm Drain [Errata]',
    SapSipper = 'Sap Sipper',
    SapSipperErrata = 'Sap Sipper [Errata]',
    FlashFire = 'Flash Fire',
    FlashFireErrata = 'Flash Fire [Errata]',
    SunBlanket = 'Sun Blanket',
    FlyingFlyTrap = 'Flying Fly Trap',
    ThickFat = 'Thick Fat',
    Filter = 'Filter',
    SolidRock = 'Solid Rock',
    Tolerance = 'Tolerance',
    Heatproof = 'Heatproof',
    HeatproofErrata = 'Heatproof [Errata]',
    Levitate = 'Levitate',
    MotorDrive = 'Motor Drive',
    VoltAbsorb = 'Volt Absorb',
    LightningRod = 'Lightning Rod',
    LightningRodErrata = 'Lightning Rod [Errata]',
    Tochukaso = 'Tochukaso',
    Windveiled = 'Windveiled',
    WindveiledErrata = 'Windveiled [Errata]',
    WintersKiss = `Winter's Kiss`,
}

export type PtuAbilityForTypeEffectiveness = PtuAbilityForOffensiveTypeEffectiveness | PtuAbilityForDefensiveTypeEffectiveness;
