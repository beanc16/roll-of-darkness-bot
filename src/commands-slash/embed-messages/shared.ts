import { EmbedBuilder } from 'discord.js';

const color = 0xCDCDCD;

export const getPagedEmbedBuilders = ({
    title,
    pages,
}: {
    title: string;
    pages: string[];
}) =>
{
    return pages.map((description, index) => {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color);

        if (pages.length > 1)
        {
            embed.setFooter({ text: `Page ${index + 1}/${pages.length}`})
        }

        return embed;
    });
};
