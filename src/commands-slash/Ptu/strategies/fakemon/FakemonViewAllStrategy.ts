import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    StringSelectMenuInteraction,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { getPagedEmbedMessages } from '../../../shared/embed-messages/shared.js';
import { FakemonViewAllActionRowBuilder, FakemonViewAllButtonCustomIds } from '../../components/fakemon/actionRowBuilders/viewMode/FakemonViewAllActionRowBuilder.js';
import { PtuFakemonCollection, PtuFakemonDexType } from '../../dal/models/PtuFakemonCollection.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';
import { PtuFakemonSubcommand } from '../../options/fakemon.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { FakemonDataTransferPipelineKey } from '../../services/FakemonDataManagers/dataTransfer/services/FakemonDataTransferService.js';
import type {
    PtuButtonIteractionStrategy,
    PtuChatIteractionStrategy,
    PtuStrategyMap,
    PtuStrategyMetadata,
    PtuStringSelectMenuIteractionStrategy,
} from '../../types/strategies.js';
import { chunkArray } from '../../../../services/chunkArray/chunkArray.js';

@staticImplements<
    PtuChatIteractionStrategy
    & PtuButtonIteractionStrategy
    & PtuStringSelectMenuIteractionStrategy
>()
export class FakemonViewAllStrategy
{
    public static key = PtuFakemonSubcommand.ViewAll;

    public static async run(
        interaction: ChatInputCommandInteraction,
        _strategies: PtuStrategyMap,
    ): Promise<boolean>
    {
        // Get options
        const region = interaction.options.getString('region') as PtuFakemonDexType | null;
        const notTransferredTo = interaction.options.getString('not_transferred_to') as FakemonDataTransferPipelineKey | null;

        // Get fakemon
        const fakemon = await PtuFakemonPseudoCache.getAll(interaction.user.id);
        if (fakemon.length === 0)
        {
            await interaction.editReply({
                content: `Could not find any fakemon that you're an editor of.`,
            });
            return true;
        }

        // Filter and chunk
        const filteredFakemon = this.filterFakemonBasedOnParameters(
            fakemon,
            region,
            notTransferredTo,
        );
        const chunkedFakemon = chunkArray({
            array: filteredFakemon,
            shouldMoveToNextChunk: (_item, _index, curChunk) => curChunk.length >= 25,
        });

        // If no fakemon, send error message
        if (filteredFakemon.length === 0)
        {
            await interaction.editReply({
                content: `Could not find any fakemon with the provided parameters.`,
            });
            return true;
        }

        // Send response
        const embeds = this.getEmbeds(filteredFakemon);
        await interaction.followUp({
            embeds,
            components: chunkedFakemon.map((chunk, index) =>
                new FakemonViewAllActionRowBuilder(chunk, index),
            ),
        });

        return true;
    }

    public static async runButton(
        interaction: ButtonInteraction,
        strategies: PtuStrategyMap,
        metadata: PtuStrategyMetadata,
    ): Promise<boolean>
    {
        const strategy = strategies[PtuSubcommandGroup.Fakemon][PtuFakemonSubcommand.View] as unknown as PtuButtonIteractionStrategy;
        return await strategy?.runButton(
            interaction,
            strategies,
            metadata,
        );
    }

    public static async runStringSelect(
        interaction: StringSelectMenuInteraction,
        strategies: PtuStrategyMap,
    ): Promise<boolean>
    {
        const { values: [value1] = [] } = interaction as {
            customId: FakemonViewAllButtonCustomIds;
            values: string[];
        };

        const strategy = strategies[PtuSubcommandGroup.Fakemon][PtuFakemonSubcommand.View] as unknown as PtuChatIteractionStrategy;

        await interaction.deferUpdate();
        return await strategy?.run(
            interaction as unknown as ChatInputCommandInteraction,
            strategies,
            { speciesName: value1 },
        );
    }

    private static getEmbeds(fakemon: PtuFakemonCollection[]): EmbedBuilder[]
    {
        return getPagedEmbedMessages({
            title: 'Fakemon',
            input: fakemon,
            parseElementToLines: element => [
                `- ${element.name} (${element.status})`,
            ],
        });
    }

    private static filterFakemonBasedOnParameters(
        fakemon: PtuFakemonCollection[],
        region: PtuFakemonDexType | null,
        notTransferredTo: FakemonDataTransferPipelineKey | null,
    ): PtuFakemonCollection[]
    {
        if (!region && !notTransferredTo)
        {
            return fakemon;
        }

        const fakemonFilteredByRegion = !!region
            ? fakemon.filter(fakemon => fakemon.dexType === region)
            : fakemon;

        if (!notTransferredTo)
        {
            return fakemonFilteredByRegion;
        }

        return fakemonFilteredByRegion.filter(curFakemon =>
        {
            switch (notTransferredTo)
            {
                case FakemonDataTransferPipelineKey.Database:
                    return !curFakemon.transferredTo.ptuDatabase;

                case FakemonDataTransferPipelineKey.GoogleSheets:
                    return !(
                        curFakemon.transferredTo.googleSheets.pokemonData
                        && curFakemon.transferredTo.googleSheets.pokemonSkills
                    );

                case FakemonDataTransferPipelineKey.Image:
                    return !curFakemon.transferredTo.imageStorage;

                default:
                    const typeCheck: never = notTransferredTo;
                    throw new Error(`Invalid notTransferredTo: ${typeCheck}`);
            }
        });
    }
}
