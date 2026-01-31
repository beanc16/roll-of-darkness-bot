import { ObjectId } from 'mongodb';

export enum PtuOracleCardCategory
{
    ThePrimordialOne = 'The Primordial One',
    // TODO: Add other categories
}

export class PtuOracleCardCollection
{
    public _id: ObjectId;
    public cardNumber: number;
    public name: string;
    public descriptor: string;
    public category: string;
    public defaultProphecy: string;

    constructor({
        _id,
        cardNumber,
        name,
        descriptor,
        category,
        defaultProphecy,
    }: {
        _id?: ObjectId;
        cardNumber: number;
        name: string;
        descriptor: string;
        category: string;
        defaultProphecy: string;
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
    }
}
