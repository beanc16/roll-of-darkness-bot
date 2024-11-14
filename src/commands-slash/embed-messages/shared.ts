import { EmbedBuilder } from 'discord.js';

const color = 0xCDCDCD;

export const getPagedEmbedBuilders = ({
    title,
    pages,
    url,
}: {
    title: string;
    pages: string[];
    url?: string;
}): EmbedBuilder[] =>
{
    const embeds = pages.map((description, index) =>
    {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color);

        if (pages.length > 1)
        {
            embed.setFooter({ text: `Page ${index + 1}/${pages.length}` });
        }

        if (url)
        {
            embed.setURL(url);
        }

        return embed;
    });

    return embeds;
};
