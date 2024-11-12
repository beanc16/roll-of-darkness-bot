export class PtuNature
{
    public name: string;
    public raisedStat: string;
    public loweredStat: string;
    public likedFlavor: string;
    public dislikedFlavor: string;

    constructor (input: string[])
    {
        const [
            name,
            raisedStat,
            loweredStat,
            likedFlavor,
            dislikedFlavor,
        ] = input;

        // Base values
        this.name = name;
        this.raisedStat = raisedStat;
        this.loweredStat = loweredStat;
        this.likedFlavor = likedFlavor;
        this.dislikedFlavor = dislikedFlavor;
    }
}
