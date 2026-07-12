import { Text } from '@beanc16/discordjs-helpers';
import { logger } from '@beanc16/logger';
import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiscordUserId } from '../../../../types/discord.js';
import { ConfirmDenyButtonActionRowBuilder, ConfirmDenyButtonCustomIds } from '../../../shared/components/ConfirmDenyButtonActionRowBuilder.js';
import { FakemonDiffEmbedMessage } from '../../components/fakemon/embeds/FakemonDiffEmbedMessage.js';
import { getEditorOfDex, isEditorOfDex } from '../../constants.js';
import { PtuFakemonCollection } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PtuFakemonSubcommand } from '../../options/fakemon.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { FakemonEditDataTransferPipelineKey, FakemonEditDataTransferService } from '../../services/FakemonDataManagers/dataTransfer/services/FakemonEditDataTransferService.js';
import { PokemonDiffService } from '../../services/PokemonDiffService/PokemonDiffService.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import type {
    PtuButtonIteractionStrategy,
    PtuChatIteractionStrategy,
    PtuStrategyMap,
    PtuStrategyMetadata,
} from '../../types/strategies.js';
import type { LookupPokemonStrategy } from '../lookup/LookupPokemonStrategy.js';
import type { FakemonDeleteStrategy } from './FakemonDeleteStrategy.js';

interface FakemonTransferEditGetParameterResults
{
    speciesName: string;
    editOfSpeciesName: string;
    editName: string;
}

@staticImplements<
    PtuChatIteractionStrategy
    & PtuButtonIteractionStrategy
>()
export class FakemonTransferEditStrategy
{
    public static key = PtuFakemonSubcommand.TransferEdit;

    public static async run(interaction: ChatInputCommandInteraction, strategies: PtuStrategyMap, options?: never): Promise<boolean>;
    public static async run(interaction: ButtonInteraction, strategies: PtuStrategyMap, options?: Partial<FakemonTransferEditGetParameterResults>): Promise<boolean>;
    public static async run(interaction: StringSelectMenuInteraction, strategies: PtuStrategyMap, options?: Partial<FakemonTransferEditGetParameterResults>): Promise<boolean>;
    public static async run(
        interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
        strategies: PtuStrategyMap,
        options?: Partial<FakemonTransferEditGetParameterResults>,
    ): Promise<boolean>
    {
        const {
            speciesName,
            editOfSpeciesName,
            editName,
        } = this.getOptions(interaction as ButtonInteraction, options);

        // Get fakemon
        const [fakemon] = await PtuFakemonPseudoCache.getByNames([speciesName], interaction.user.id);
        if (!fakemon)
        {
            await interaction.editReply({
                content: `Fakemon titled \`${speciesName}\` does not exist or you are not an editor of it.`,
            });
            return true;
        }

        // Get base species
        // eslint-disable-next-line no-unsafe-optional-chaining
        const [baseSpecies] = await (strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Pokemon] as typeof LookupPokemonStrategy)?.getLookupData({
            names: [editOfSpeciesName],
        });
        if (!baseSpecies)
        {
            await interaction.editReply({
                content: `Pokemon titled \`${baseSpecies}\` does not exist.`,
            });
            return true;
        }

        // Update edit information
        const message = await interaction.fetchReply();
        const updatedFakemon = await PtuFakemonPseudoCache.update(message.id, { id: fakemon.id }, {
            editOfPokemonName: editOfSpeciesName,
            editName,
        });

        // Get diff for embed
        const diff = PokemonDiffService.getDifference({
            originalPokemon: baseSpecies,
            newPokemon: fakemon,
        });

        // Send transfer confirmation message
        await interaction.followUp({
            content: [
                `Are you sure that you want to transfer ${Text.Code.oneLine(speciesName)} as an edit of ${Text.Code.oneLine(editOfSpeciesName)}? Please review the new updates between the two below.`,
                this.convertTransferredToForDisplay(updatedFakemon),
            ].join('\n'),
            components: [
                new ConfirmDenyButtonActionRowBuilder(),
            ],
            embeds: [
                new FakemonDiffEmbedMessage(
                    diff,
                    { name: fakemon.name, metadata: fakemon.metadata },
                    updatedFakemon.status,
                ),
            ],
        });

        return true;
    }

    public static async runButton(
        interaction: ButtonInteraction,
        strategies: PtuStrategyMap,
        _metadata: PtuStrategyMetadata,
    ): Promise<boolean>
    {
        // Defer update
        await interaction.deferUpdate();

        const { customId } = interaction as { customId: ConfirmDenyButtonCustomIds };
        const untypedFakemon = PtuFakemonPseudoCache.getByMessageId(interaction.message.id);
        let errorMessages: string[] = [];
        if (!untypedFakemon)
        {
            errorMessages.push('Fakemon not found');
        }
        if (untypedFakemon && !untypedFakemon.editors.includes(interaction.user.id))
        {
            errorMessages.push('You do not have permission to edit this fakemon');
        }
        if (untypedFakemon && !untypedFakemon.editOfPokemonName)
        {
            errorMessages.push('Name of Pokemon that fakemon is an edit of is not set');
        }
        if (untypedFakemon && !untypedFakemon.editName)
        {
            errorMessages.push('Name of edit is not set');
        }
        if (untypedFakemon && !isEditorOfDex(untypedFakemon.dexType, interaction.user.id as DiscordUserId))
        {
            const editors = getEditorOfDex(untypedFakemon.dexType);
            const editorPings = editors.map((editor) => Text.Ping.user(editor)).join(', ');
            errorMessages.push(`You do not have permission to edit this fakemon. Please ask ${editorPings} for approval.`);
        }
        if (errorMessages.length > 0)
        {
            await interaction.followUp({
                content: 'The following errors were found:\n' + errorMessages.join('\n- '),
                ephemeral: true,
            });
            return true;
        }

        const fakemon = untypedFakemon!;
        switch (customId)
        {
            case ConfirmDenyButtonCustomIds.Confirm:
                try
                {
                    // Send first response
                    await interaction.followUp({
                        content: `Beginning data transfer for ${Text.Code.oneLine(fakemon.name)} as an edit of ${Text.Code.oneLine(fakemon.editOfPokemonName!)} named ${Text.Code.oneLine(fakemon.editName!)}. Please be patient, this may take a few seconds...`,
                    });

                    // Transfer fakemon edit
                    const service = new FakemonEditDataTransferService();
                    await service.transfer(fakemon, [FakemonEditDataTransferPipelineKey.Database]);

                    // Get updated fakemon
                    const [updatedFakemon] = await PtuFakemonPseudoCache.getByNames([fakemon.name], interaction.user.id);

                    // Send response
                    if (updatedFakemon.transferredTo.ptuDatabase)
                    {
                        await (strategies[PtuSubcommandGroup.Lookup][PtuLookupSubcommand.Pokemon] as typeof LookupPokemonStrategy)?.run(interaction, strategies, {
                            names: [fakemon.editOfPokemonName],
                            interactionType: 'followUp',
                        });
                    }
                    await interaction.followUp({
                        content: [
                            `Fakemon ${Text.Code.oneLine(updatedFakemon.name)} transferred as an edit of ${Text.Code.oneLine(fakemon.editOfPokemonName!)} named ${Text.Code.oneLine(fakemon.editName!)} to the following locations:`,
                            this.convertTransferredToForDisplay(updatedFakemon),
                        ].join('\n'),
                    });
                    await interaction.message.edit({
                        content: `Successfully transferred ${Text.Code.oneLine(updatedFakemon.name)} as an edit of ${Text.Code.oneLine(fakemon.editOfPokemonName!)} named ${Text.Code.oneLine(fakemon.editName!)}.`,
                        components: [], // Remove buttons so transfer doesn't occur again
                    });

                    // Delete the fakemon if it's transferred to all locations
                    if (updatedFakemon.transferredTo.ptuDatabase)
                    {
                        await (strategies[PtuSubcommandGroup.Fakemon][PtuFakemonSubcommand.Delete] as typeof FakemonDeleteStrategy)?.run(interaction, strategies, {
                            speciesName: updatedFakemon.name,
                        });
                    }
                }
                catch (error)
                {
                    logger.error('Failed to transfer fakemon as an edit', error, {
                        fakemonName: fakemon.name, editOfPokemonName: fakemon.editOfPokemonName, editName: fakemon.editName,
                    });
                    const errorMessage = (error as Error)?.message;
                    await interaction.followUp({
                        content: [
                            `Failed to transfer fakemon as an edit${errorMessage ? ' with error:' : ''}`,
                            ...(errorMessage ? [Text.Code.multiLine(errorMessage)] : []),
                        ].join('\n'),
                        ephemeral: true,
                    });
                }
                break;

            case ConfirmDenyButtonCustomIds.Deny:
                // Send response
                await interaction.editReply({
                    content: `Canceled transferring ${Text.Code.oneLine(fakemon.name)} as an edit of ${Text.Code.oneLine(fakemon.editOfPokemonName!)} named ${Text.Code.oneLine(fakemon.editName!)}.`,
                    components: [],
                    embeds: [],
                });
                break;

            default:
                const typeCheck: never = customId;
                throw new Error(`Unknown customId: ${typeCheck}`);
        }

        return true;
    }

    private static getOptions(interaction: ChatInputCommandInteraction, options?: never): FakemonTransferEditGetParameterResults;
    private static getOptions(interaction: ButtonInteraction, options?: Partial<FakemonTransferEditGetParameterResults>): FakemonTransferEditGetParameterResults;
    private static getOptions(interaction: StringSelectMenuInteraction, options?: Partial<FakemonTransferEditGetParameterResults>): FakemonTransferEditGetParameterResults;
    private static getOptions(
        untypedInteraction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction,
        options?: FakemonTransferEditGetParameterResults,
    ): FakemonTransferEditGetParameterResults
    {
        if (options)
        {
            return options;
        }

        const interaction = untypedInteraction as ChatInputCommandInteraction;

        const speciesName = interaction.options.getString(PtuAutocompleteParameterName.FakemonSpeciesName, true);
        const editOfSpeciesName = interaction.options.getString(PtuAutocompleteParameterName.PokemonName, true);
        const editName = interaction.options.getString('edit_name', true);

        return {
            speciesName,
            editOfSpeciesName,
            editName,
        };
    }

    private static convertTransferredToForDisplay(fakemon: Pick<PtuFakemonCollection, 'transferredTo'>): string
    {
        return Text.Code.multiLine(
            JSON.stringify(fakemon.transferredTo, null, 2),
        );
    }
}
