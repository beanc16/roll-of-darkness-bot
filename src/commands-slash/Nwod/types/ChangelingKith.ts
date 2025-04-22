export class ChangelingKith
{
    public name: string;
    public pageNumber: string;
    public blessing: string;

    constructor(input: string[])
    {
        const [
            name,
            pageNumber,
            blessing,
        ] = input;

        // Base values
        this.name = name.trim();
        this.pageNumber = pageNumber.trim();
        this.blessing = blessing.trim();
    }
}
