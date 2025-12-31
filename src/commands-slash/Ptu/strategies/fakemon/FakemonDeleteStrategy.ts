import { Text } from '@beanc16/discordjs-helpers';
import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PtuFakemonSubcommand } from '../../options/fakemon.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import type { PtuButtonIteractionStrategy, PtuChatIteractionStrategy, PtuStrategyMap } from '../../types/strategies.js';
import { ConfirmDenyButtonActionRowBuilder, ConfirmDenyButtonCustomIds } from '../../../shared/components/ConfirmDenyButtonActionRowBuilder.js';

@staticImplements<
    PtuChatIteractionStrategy
    & PtuButtonIteractionStrategy
>()
export class FakemonDeleteStrategy
{
    public static key = PtuFakemonSubcommand.Delete;

    public static async run(
        interaction: ChatInputCommandInteraction,
        _strategies: PtuStrategyMap,
    ): Promise<boolean>
    {
        const { speciesName } = this.getOptions(interaction);

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

        switch (customId)
        {
            case ConfirmDenyButtonCustomIds.Confirm:
                // Delete fakemon
                await PtuFakemonPseudoCache.softDelete(interaction.message.id, fakemon);

                // Send response
                await interaction.followUp({
                    content: `Fakemon ${Text.Code.oneLine(fakemon.name)} deleted.`,
                });
                break;

            case ConfirmDenyButtonCustomIds.Deny:
                // Remove from cache
                PtuFakemonPseudoCache.removeFromCache(interaction.message.id);

                // Send response
                await interaction.followUp({
                    content: `Canceled deleting ${Text.Code.oneLine(fakemon.name)}.`,
                });
                break;

            default:
                const typeGuard: never = customId;
                throw new Error(`Unhandled customId: ${typeGuard}`);
        }

        // Delete confirm/deny message
        await interaction.message.delete();

        return true;
    }

    private static getOptions(interaction: ChatInputCommandInteraction): { speciesName: string }
    {
        const speciesName = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName, true);

        return { speciesName };
    }
}
