export enum GeistKey
{
    Beasts = 'Beasts',
    Blood = 'Blood',
    Chance = 'Chance',
    ColdWind = 'Cold Wind',
    DeepWaters = 'Deep Waters',
    Disease = 'Disease',
    GraveDirt = 'Grave-Dirt',
    PyreFlame = 'Pyre Flame',
    Stillness = 'Stillness',
}

export enum GeistMementoType
{
    Deathmask = 'Deathmask',
    GreaterMemento = 'Greater Memento',
    Memento = 'Memento',
    Vanitas = 'Vanitas',
}

export class GeistMemento
{
    public name: string;
    public key: GeistKey;
    public pageNumber: string;
    public type: GeistMementoType;
    public description: string;
    public effect: string;

    constructor(input: string[])
    {
        const [
            name,
            key,
            pageNumber,
            type,
            description,
            effect,
        ] = input;

        // Base values
        this.name = name.trim();
        this.key = key.trim() as GeistKey;
        this.pageNumber = pageNumber.trim();
        this.type = type.trim() as GeistMementoType;
        this.description = description.trim();
        this.effect = effect.trim();
    }
}
