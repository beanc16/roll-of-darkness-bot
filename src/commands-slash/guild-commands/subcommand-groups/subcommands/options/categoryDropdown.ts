import { SlashCommandStringOption } from 'discord.js';
import FlavorTextService from '../../../../../services/FlavorTextService.js';

export function categoryDropdown(option: SlashCommandStringOption, categoryNumber = 1, {
    parameterName,
    type,
    notType,
}: {
    parameterName?: string;
    type?: string;
    notType?: string;
} = {})
{
    const flavorTextService = new FlavorTextService();

    const description = (parameterName === 'splat')
        ? 'The supernatural splat to get flavor text for (default: General)'
        : 'The non-splat category to get flavor text for';

    option.setName(parameterName || `category${categoryNumber}`);
    option.setDescription(description);
    return option.addChoices(
        ...flavorTextService.getAllCategoriesAsStringOptionChoices({
            ...(type !== undefined && { type }),
            ...(notType !== undefined && { notType }),
        }),
    );
}
