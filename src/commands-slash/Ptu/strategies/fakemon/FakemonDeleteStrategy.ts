import { Text } from '@beanc16/discordjs-helpers';
import { ButtonInteraction, ChatInputCommandInteraction, StringSelectMenuInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { ConfirmDenyButtonActionRowBuilder, ConfirmDenyButtonCustomIds } from '../../../shared/components/ConfirmDenyButtonActionRowBuilder.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PtuFakemonSubcommand } from '../../options/fakemon.js';
import { HomebrewPokeApi } from '../../services/HomebrewPokeApi/HomebrewPokeApi.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import type {
    PtuButtonIteractionStrategy,
    PtuChatIteractionStrategy,
    PtuStrategyMap,
} from '../../types/strategies.js';

interface FakemonDeleteGetParameterResults
{
    speciesName: string;
}

@staticImplements<
    PtuChatIteractionStrategy
    & PtuButtonIteractionStrategy
>()
export class FakemonDeleteStrategy
{
    public static key = PtuFakemonSubcommand.Delete;

    public static async run(interaction: ChatInputCommandInteraction, strategies: PtuStrategyMap, options?: never): Promise<boolean>;
    public static async run(interaction: ButtonInteraction, strategies: PtuStrategyMap, options?: Partial<FakemonDeleteGetParameterResults>): Promise<boolean>;
    public static async run(interaction: StringSelectMenuInteraction, strategies: PtuStrategyMap, options?: Partial<FakemonDeleteGetParameterResults>): Promise<boolean>;
    public static async run(
        interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
        _strategies: PtuStrategyMap,
        options?: Partial<FakemonDeleteGetParameterResults>,
    ): Promise<boolean>
    {
        const { speciesName } = this.getOptions(interaction, options);

        // Get fakemon
        const [fakemon] = await PtuFakemonPseudoCache.getByNames([speciesName], interaction.user.id);
        if (!fakemon)
        {
            await interaction.editReply({
                content: `Fakemon titled \`${speciesName}\` does not exist or you are not an editor of it.`,
            });
            return true;
        }

        // Send response
        const message = await interaction.fetchReply();
        await interaction.followUp({
            content: `Are you sure that you want to delete ${Text.Code.oneLine(speciesName)}?`,
            components: [
                new ConfirmDenyButtonActionRowBuilder(),
            ],
        });

        // Add to cache
        PtuFakemonPseudoCache.addToCache(message.id, fakemon);

        return true;
    }

    public static async runButton(interaction: ButtonInteraction): Promise<boolean>
    {
        // Defer update
        await interaction.deferUpdate();

        const { customId } = interaction as { customId: ConfirmDenyButtonCustomIds };
        const fakemon = PtuFakemonPseudoCache.getByMessageId(interaction.message.id);
        if (!fakemon)
        {
            throw new Error('Fakemon not found');
        }
        if (!fakemon.editors.includes(interaction.user.id))
        {
            throw new Error('You do not have permission to edit this fakemon');
        }

        switch (customId)
        {
            case ConfirmDenyButtonCustomIds.Confirm:
                // Delete fakemon
                await PtuFakemonPseudoCache.softDelete(interaction.message.id, fakemon);

                // Delete image
                await HomebrewPokeApi.deleteFakemonImage(fakemon.name);

                // Send response
                await interaction.editReply({
                    content: `Fakemon ${Text.Code.oneLine(fakemon.name)} deleted.`,
                    components: [],
                });
                break;

            case ConfirmDenyButtonCustomIds.Deny:
                // Remove from cache
                PtuFakemonPseudoCache.removeFromCache(interaction.message.id);

                // Send response
                await interaction.editReply({
                    content: `Canceled deleting ${Text.Code.oneLine(fakemon.name)}.`,
                    components: [],
                });
                break;

            default:
                const typeGuard: never = customId;
                throw new Error(`Unhandled customId: ${typeGuard}`);
        }

        return true;
    }

    private static getOptions(
        untypedInteraction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
        options?: Partial<FakemonDeleteGetParameterResults>,
    ): FakemonDeleteGetParameterResults
    {
        if (options?.speciesName)
        {
            return options as FakemonDeleteGetParameterResults;
        }

        const interaction = untypedInteraction as ChatInputCommandInteraction;

        const speciesName = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName, true);

        return { speciesName };
    }
}
