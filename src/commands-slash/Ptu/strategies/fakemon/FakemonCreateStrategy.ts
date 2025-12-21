import {
    Attachment,
    ChatInputCommandInteraction,
    EmbedBuilder,
    User,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuFakemonSubcommand } from '../../options/fakemon.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import type { PtuChatIteractionStrategy, PtuStrategyMap } from '../../types/strategies.js';

interface FakemonCreateGetParameterResults
{
    speciesName: string;
    baseSpeciesOn: string | null;
    baseMovesOn: string | null;
    baseAbilitiesOn: string | null;
    image: Attachment | null;
    imageUrl: string | null;
    coEditor: User | null;
}

@staticImplements<PtuChatIteractionStrategy>()
export class FakemonCreateStrategy
{
    public static key = PtuFakemonSubcommand.Create;

    public static async run(
        interaction: ChatInputCommandInteraction,
        _strategies: PtuStrategyMap,
    ): Promise<boolean>
    {
        // const {
        //     speciesName,
        //     baseSpeciesOn,
        //     baseMovesOn,
        //     baseAbilitiesOn,
        //     image,
        //     imageUrl,
        //     coEditor,
        // } = this.getParameterResults(interaction);
        this.getOptions(interaction);

        // Send response
        const embeds = this.getEmbeds();

        await interaction.editReply({
            content: 'This command is not yet implemented.',
            embeds,
        });

        return true;
    }

    private static getOptions(interaction: ChatInputCommandInteraction): FakemonCreateGetParameterResults
    {
        const speciesName = interaction.options.getString('species_name', true);
        const baseSpeciesOn = interaction.options.getString(PtuAutocompleteParameterName.BaseSpeciesOn);
        const baseMovesOn = interaction.options.getString(PtuAutocompleteParameterName.BaseMovesOn);
        const baseAbilitiesOn = interaction.options.getString(PtuAutocompleteParameterName.BaseAbilitiesOn);
        const image = interaction.options.getAttachment('image');
        const imageUrl = interaction.options.getString('image_url');
        const coEditor = interaction.options.getUser('co_editor');

        return {
            speciesName,
            baseSpeciesOn,
            baseMovesOn,
            baseAbilitiesOn,
            image,
            imageUrl,
            coEditor,
        };
    }

    private static getEmbeds(): EmbedBuilder[]
    {
        return [
        ];
    }
}
