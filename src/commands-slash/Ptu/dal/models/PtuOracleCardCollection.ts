import { ObjectId } from 'mongodb';

export enum PtuOracleCardCategory
{
    ThePrimordialOne = 'The Primordial One',
    TheCreationTrio = 'The Creation Trio',
    TheWeatherTrio = 'The Weather Trio',
    TheProtagonists = 'The Protagonists',
    TheSacredDefenders = 'The Sacred Defenders',
    TheMortalityTrio = 'The Mortality Trio',
    TheWeapons = 'The Weapons',
    TheTaoTrio = 'The Tao Trio',
    TheAfterlifeTrio = 'The Afterlife Trio',
    TheLegendaryIdols = 'The Legendary Idols',
    TheLone = 'The Lone',
    TheLegendarySteeds = 'The Legendary Steeds',
    TheLegendarySpirits = 'The Legendary Spirits',
    TheForsaken = 'The Forsaken',
    TheTowerDuo = 'The Tower Duo',
    TheEdenianBeasts = 'The Edenian Beasts',
    TheUltraBeastSummoners = 'The Ultra Beast Summoners',
}

export enum PtuOracleCardProphecyFace
{
    Normal = 'Normal',
    Reverse = 'Reverse',
}

export class PtuOracleCardCollection
{
    public _id: ObjectId;
    public cardNumber: number;
    public name: string;
    public descriptor: string;
    public category: string;
    public defaultProphecy: string;
    public defaultReverseProphecy: string;

    constructor({
        _id,
        cardNumber,
        name,
        descriptor,
        category,
        defaultProphecy,
        defaultReverseProphecy,
    }: {
        _id?: ObjectId;
        cardNumber: number;
        name: string;
        descriptor: string;
        category: string;
        defaultProphecy: string;
        defaultReverseProphecy: string;
    })
    {
        if (_id)
        {
            // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
            this._id = _id;
        }
        else
        {
            // eslint-disable-next-line no-underscore-dangle -- Use an underscore to properly interface with mongodb's default _id property
            this._id = new ObjectId();
        }

        this.cardNumber = cardNumber;
        this.name = name;
        this.descriptor = descriptor;
        this.category = category;
        this.defaultProphecy = defaultProphecy;
        this.defaultReverseProphecy = defaultReverseProphecy;
    }
}
