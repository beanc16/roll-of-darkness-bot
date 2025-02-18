/*
The legendariesCsv is a string of legendaries separated by newlines.

Each line could have parenthesis, which surround the names of the legendaries
as a CSV if the line is for a group. For example:
Legendary Birds (Articuno, Moltres, Zapdos)

However, it could also just be the name of the legendary itself. For example:
Articuno

It could also include square brackets around the aura name if a single entry
is for multiple types of auras. For example:
Arceus [Nature, Ocean, Sky]

Lastly, it could potentially include curly brackets for a comment clarifying
when the legendary has the aura. For example:
Zamazenta {If Hiding}
*/

interface ParseLegendariesCsvResponse
{
    legendaries: string[];
    legendaryGroups: string[];
}

export class PtuAura
{
    public name: string;
    public effect: string;
    public legendaries: string[];
    public legendaryGroups: string[];

    constructor(input: string[])
    {
        const [
            name,
            effect,
            legendariesCsv,
        ] = input;

        // Parse data
        const { legendaries, legendaryGroups } = PtuAura.parseLegendariesCsv(legendariesCsv);

        // Base values
        this.name = name;
        this.effect = effect;
        this.legendaries = legendaries;
        this.legendaryGroups = legendaryGroups;
    }

    private static parseLegendariesCsv(legendariesCsv: string): ParseLegendariesCsvResponse
    {
        const legendariesLines = legendariesCsv.split('\n');

        return legendariesLines.reduce<ParseLegendariesCsvResponse>((acc, line) =>
        {
            let cleanedLine = line.trim();
            const curLegendaryNames: string[] = [];

            // Extract and preserve comments within curly brackets
            const comments = [...cleanedLine.matchAll(/\{.*?\}/g)].map(match => match[0].replace('{', '').replace('}', ''));

            // Remove comments and curly brackets around it
            cleanedLine = cleanedLine.replace(/\{.*?\}/g, '').trim();

            // Extract and flatten names within parentheses
            const groupMatches = [...cleanedLine.matchAll(/\((.*?)\)/g)];
            groupMatches.forEach((match) =>
            {
                const names = match[1].split(',').map(name => name.trim());
                curLegendaryNames.push(...names);
            });

            // Remove main names if a group name is present
            cleanedLine = cleanedLine.replace(/\(.*?\)/g, '').trim();

            // Preserve aura brackets
            const auras = [...cleanedLine.matchAll(/\[.*?\]/g)].map(match => match[0].replace('[', '').replace(']', ''));

            // Remove aura name and square brackets around it
            cleanedLine = cleanedLine.replace(/\[.*?\]/g, '').trim();

            // Add the cleaned name along with auras and comments
            if (cleanedLine.length > 0 && curLegendaryNames.length === 0)
            {
                const fullEntry = this.getFullEntryForLegendariesCsv({
                    cleanedLine,
                    auras,
                    comments,
                });
                acc.legendaries.push(fullEntry);
            }
            else if (curLegendaryNames.length > 0)
            {
                curLegendaryNames.forEach(name =>
                {
                    const fullEntry = this.getFullEntryForLegendariesCsv({
                        cleanedLine: name,
                        auras,
                        comments,
                    });
                    acc.legendaries.push(fullEntry);
                });
                acc.legendaryGroups.push(cleanedLine);
            }

            return acc;
        }, { legendaries: [], legendaryGroups: [] });
    }

    private static getFullEntryForLegendariesCsv({
        cleanedLine,
        auras,
        comments,
    }: { cleanedLine: string; auras: string[]; comments: string[] }): string
    {
        let fullEntry = cleanedLine;

        if (auras.length > 0)
        {
            fullEntry += ` [${auras.join(', ')}]`;
        }
        if (comments.length > 0)
        {
            fullEntry += ` (${comments.join(', ')})`;
        }

        return fullEntry;
    }
}
