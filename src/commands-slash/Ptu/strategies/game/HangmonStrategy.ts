import type { ChatInputCommandInteraction, User } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { BaseGenerateStrategy } from '../../../strategies/BaseGenerateStrategy/BaseGenerateStrategy.js';
import type { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { HangmonEmbedMessage } from '../../components/game/HangmonEmbedMessage.js';
import type { PtuPokemonForLookupPokemon } from '../../embed-messages/lookup.js';
import { PtuGameSubcommand } from '../../options/game.js';
import { LookupPokemonStrategy } from '../lookup/LookupPokemonStrategy.js';

// Always include name, then pick 5 others randomly
enum HangmonPropertyHints
{
    Name = 'Name',
    OneType = 'One Type',
    PtuSize = 'PTU Size',
    PtuWeightClass = 'PTU Weight Class',
    Habitat = 'Habitat',
    OneEggGroup = 'One Egg Group',
    DexName = 'Pokédex Name',
}

@staticImplements<ChatIteractionStrategy>()
export class HangmonStrategy extends BaseGenerateStrategy
{
    public static key: PtuGameSubcommand.Hangmon = PtuGameSubcommand.Hangmon;
    private static maxNumberOfPlayers = 6;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get data
        const players = this.getPlayers(interaction);
        const { randomPokemon } = await this.getPokemon();

        // Send message
        const embed = new HangmonEmbedMessage({
            user: interaction.user,
            players,
            fields: [ // TODO: This is for temporary testing purposes, only show name and 5 other random values with "???" later and only one non-name field revealed as a hint
                { name: HangmonPropertyHints.Name, value: randomPokemon.name },
                { name: HangmonPropertyHints.OneType, value: randomPokemon.types[0] },
                { name: HangmonPropertyHints.PtuSize, value: randomPokemon.sizeInformation.height.ptu },
                { name: HangmonPropertyHints.PtuWeightClass, value: randomPokemon.sizeInformation.weight.ptu.toString() },
                { name: HangmonPropertyHints.Habitat, value: randomPokemon.habitats[0] },
                { name: HangmonPropertyHints.OneEggGroup, value: randomPokemon.breedingInformation.eggGroups[0] },
                { name: HangmonPropertyHints.DexName, value: randomPokemon.metadata.source },
            ],
            maxAttempts: 6,
        });
        await interaction.editReply({ embeds: [embed] });

        return true;
    }

    /* istanbul ignore next */
    private static getPlayers(interaction: ChatInputCommandInteraction): User[]
    {
        const players = [interaction.user];

        for (let index = 2; index <= this.maxNumberOfPlayers; index += 1)
        {
            const player = interaction.options.getUser(`player_${index}`);

            if (player)
            {
                players.push(player);
            }
        }

        return players;
    }

    /* istanbul ignore next */
    private static async getPokemon(): Promise<{ allPokemon: PtuPokemonForLookupPokemon[]; randomPokemon: PtuPokemonForLookupPokemon }>
    {
        const allPokemon = await LookupPokemonStrategy.getLookupData({ getAll: true });

        const [index] = new DiceLiteService({
            count: 1,
            sides: allPokemon.length,
        }).roll();

        return {
            allPokemon,
            randomPokemon: allPokemon[index - 1],
        };
    }
}
