import { SlashCommandSubcommandBuilder } from 'discord.js';

import { imageOption, imageUrlOption } from '../../shared/options/image.js';
import { PtuAutocompleteParameterName } from '../types/autocomplete.js';

export enum PtuFakemonSubcommand
{
    Create = 'create',
    Delete = 'delete',
    Edit = 'edit',
    Review = 'review',
    Transfer = 'transfer',
    ViewAll = 'view_all',
}

export const create = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuFakemonSubcommand.Create);
    subcommand.setDescription('Create a custom pokemon.');

    subcommand.addStringOption((option) =>
    {
        option.setName('species_name');
        option.setDescription(`The name of the custom Pokémon species.`);
        return option.setRequired(true);
    });

    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.BaseSpeciesOn);
        option.setDescription(`The species to base the custom Pokémon on.`);
        return option.setAutocomplete(true);
    });

    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.BaseMovesOn);
        option.setDescription(`The species to base the custom Pokémon's moveset on (overrides ${PtuAutocompleteParameterName.BaseSpeciesOn}).`);
        return option.setAutocomplete(true);
    });

    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.BaseAbilitiesOn);
        option.setDescription(`The species to base the custom Pokémon's abilities on (overrides ${PtuAutocompleteParameterName.BaseSpeciesOn}).`);
        return option.setAutocomplete(true);
    });

    subcommand.addAttachmentOption((option) => imageOption(option, 'A picture of the custom Pokémon species. This will take precedence over image_url.'));
    subcommand.addStringOption((option) => imageUrlOption(option, 'The URL of an image of the custom Pokémon species.'));

    subcommand.addUserOption((option) =>
    {
        option.setName('co_editor');
        return option.setDescription('A co-editor of the custom Pokémon.');
    });

    return subcommand;
};

export const deleteFakemon = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuFakemonSubcommand.Delete);
    subcommand.setDescription('Delete a custom pokemon.');

    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.FakemonSpeciesName);
        option.setDescription(`The name of the custom Pokémon species.`);
        option.setAutocomplete(true);
        return option.setRequired(true);
    });

    return subcommand;
};

export const edit = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(PtuFakemonSubcommand.Edit);
    subcommand.setDescription('Edit a custom pokemon.');

    subcommand.addStringOption((option) =>
    {
        option.setName(PtuAutocompleteParameterName.FakemonSpeciesName);
        option.setDescription(`The name of the custom Pokémon species.`);
        option.setAutocomplete(true);
        return option.setRequired(true);
    });

    subcommand.addAttachmentOption((option) => imageOption(option, 'A picture of the custom Pokémon species. This will take precedence over image_url.'));
    subcommand.addStringOption((option) => imageUrlOption(option, 'The URL of an image of the custom Pokémon species.'));

    subcommand.addUserOption((option) =>
    {
        option.setName('co_editor_to_add');
        return option.setDescription('A co-editor of the custom Pokémon to add.');
    });

    subcommand.addUserOption((option) =>
    {
        option.setName('co_editor_to_remove');
        return option.setDescription('A co-editor of the custom Pokémon to remove (will include users that are not editors).');
    });

    return subcommand;
};
