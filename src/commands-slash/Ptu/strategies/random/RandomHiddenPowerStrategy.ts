import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { DiscordInteractionCallbackType } from '../../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../../strategies/RerollStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuRandomSubcommand } from '../../options/random.js';
import { PokemonType } from '../../types/pokemon.js';

interface GetRollsAndTypeResponse
{
    rolls: number[];
    type: PokemonType;
}

@staticImplements<ChatIteractionStrategy>()
export class RandomHiddenPowerStrategy
{
    public static key: PtuRandomSubcommand.HiddenPower = PtuRandomSubcommand.HiddenPower;
    private static rollResultToType: Record<number, PokemonType> = {
        1: PokemonType.Bug,
        2: PokemonType.Dark,
        3: PokemonType.Dragon,
        4: PokemonType.Electric,
        5: PokemonType.Fairy,
        6: PokemonType.Fighting,
        7: PokemonType.Fire,
        8: PokemonType.Flying,
        9: PokemonType.Ghost,
        10: PokemonType.Grass,
        11: PokemonType.Ground,
        12: PokemonType.Ice,
        13: PokemonType.Normal,
        14: PokemonType.Poison,
        15: PokemonType.Psychic,
        16: PokemonType.Rock,
        17: PokemonType.Steel,
        18: PokemonType.Water,
    };

    public static async run(
        interaction: ChatInputCommandInteraction,
        rerollCallbackOptions: OnRerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    ): Promise<boolean>
    {
        // Get rolls and type
        const result = this.getRollsAndType();

        // Get embed
        const embed = this.getEmbedMessage(result);

        // Send embed with reroll button
        await RerollStrategy.run({
            interaction,
            options: {
                embeds: [embed],
            },
            rerollCallbackOptions,
            onRerollCallback: newRerollCallbackOptions => this.run(
                interaction,
                newRerollCallbackOptions,
            ),
            commandName: `/ptu ${PtuSubcommandGroup.Random} ${this.key}`,
        });

        return true;
    }

    private static getRollsAndType(): GetRollsAndTypeResponse
    {
        const rolls = [];

        // Get random number
        const [roll] = new DiceLiteService({
            count: 1,
            sides: 20,
        }).roll();
        rolls.push(roll);

        // Get random type
        let type = this.rollResultToType[roll];

        // Roll was not 1-18, roll again
        if (!type)
        {
            const recursiveResult = this.getRollsAndType();
            rolls.push(...recursiveResult.rolls);
            type = recursiveResult.type;
        }

        return {
            rolls,
            type,
        };
    }

    /* istanbul ignore next */
    private static getEmbedMessage({ rolls, type }: GetRollsAndTypeResponse): EmbedBuilder
    {
        const embed = new EmbedBuilder({
            title: 'Random Hidden Power Type',
            description: [
                `Roll Results: (${rolls.join(', ')})`,
            ].join('\n'),
            fields: [{ name: 'Type', value: type }],
            color: 0xCDCDCD,
        });

        return embed;
    }
}
