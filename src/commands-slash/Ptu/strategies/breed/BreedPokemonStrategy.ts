import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    Message,
} from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { DiceLiteService } from '../../../../services/DiceLiteService.js';
import { ButtonListenerRestartStyle, ButtonStrategy } from '../../../strategies/ButtonStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { getPokemonBreedingEmbedMessage } from '../../embed-messages/breed.js';
import { PtuBreedSubcommand } from '../../options/breed.js';
import {
    type GetGenderResult,
    PokemonGender,
    type RollShinyResult,
    type RollSpeciesResult,
} from '../../types/breed.js';
import { PtuNature } from '../../types/PtuNature.js';
import { RandomNatureStrategy } from '../random/RandomNatureStrategy.js';

enum BreedPokemonButtonName
{
    Yes = 'Yes',
    No = 'No',
}

interface GetResult
{
    buttonInteraction?: ButtonInteraction;
}

type ButtonHandlerMap<Key extends string> = Record<Key, () => Promise<void> | void>;

@staticImplements<ChatIteractionStrategy>()
export class BreedPokemonStrategy
{
    public static key = PtuBreedSubcommand.Breed;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const pokemonEducationRank = interaction.options.getInteger('pokemon_education_rank', true);
        const maleSpecies = interaction.options.getString('male_species', true);
        const femaleSpecies = interaction.options.getString('female_species', true);
        const gm = interaction.options.getUser('gm', true);

        // Get properties of the new pokemon
        const speciesResult = this.rollSpecies(
            maleSpecies,
            femaleSpecies,
        );

        const {
            nature,
            buttonInteraction: natureButtonInteraction,
            message,
        } = await this.getNature(
            interaction,
            pokemonEducationRank,
        );

        const { shouldPickAbilityManually, buttonInteraction: abilityButtonInteraction } = await this.getAbility(
            interaction,
            pokemonEducationRank,
            message,
            natureButtonInteraction,
        );

        const genderResult = await this.getGender(
            interaction,
            pokemonEducationRank,
            message,
            abilityButtonInteraction,
        );

        const shinyResult = this.rollShiny();

        // Send response
        const embed = getPokemonBreedingEmbedMessage({
            speciesResult,
            nature,
            shouldPickAbilityManually,
            genderResult,
            shinyResult,
            user: interaction.user,
            gm,
        });

        await interaction.editReply({
            embeds: [embed],
            content: '',
            components: [],
        });

        // TODO: Add followup for picking things, adding inheritance moves, etc.

        return true;
    }

    private static async getNature(
        interaction: ChatInputCommandInteraction,
        pokemonEducationRank: number,
    ): Promise<{ nature: PtuNature | undefined; message?: Message } & GetResult>
    {
        // Get a random nature
        const {
            natures: [randomNature],
        } = await RandomNatureStrategy.getRandomNatures(1);

        if (pokemonEducationRank < 4)
        {
            return { nature: randomNature };
        }

        // Ask if the user wants to manually pick
        const message = await this.updateMessage({
            interaction,
            content: 'Would you like to pick a Nature manually?',
            component: this.getYesNoButtonRowComponent(),
        });

        let nature: PtuNature | undefined = randomNature;
        let buttonInteraction: ButtonInteraction | undefined;
        await ButtonStrategy.handleButtonInteractions({
            interactionResponse: message!,
            commandName: `/ptu ${this.key}`,
            restartStyle: ButtonListenerRestartStyle.Never,
            onButtonPress: async (buttonInteractionOnPress) =>
            {
                buttonInteraction = buttonInteractionOnPress;
                const key = buttonInteractionOnPress.customId as BreedPokemonButtonName;
                const handlerMap: ButtonHandlerMap<BreedPokemonButtonName> = {
                    [BreedPokemonButtonName.Yes]: () =>
                    {
                        nature = undefined;
                    },
                    [BreedPokemonButtonName.No]: async () =>
                    {
                        // No-Op. This is already handled
                        // at the start of the function.
                    },
                };

                await handlerMap[key]();
            },
            getButtonRowComponent: () => this.getYesNoButtonRowComponent(),
        });

        return {
            nature,
            buttonInteraction,
            message,
        };
    }

    private static async getAbility(
        interaction: ChatInputCommandInteraction,
        pokemonEducationRank: number,
        message: Message | undefined,
        inputButtonInteraction: ButtonInteraction | undefined,
    ): Promise<{ shouldPickAbilityManually: boolean } & GetResult>
    {
        let shouldPickAbilityManually = false;

        if (pokemonEducationRank < 5)
        {
            return { shouldPickAbilityManually };
        }

        // Ask if the user wants to manually pick
        await this.updateMessage({
            interaction,
            buttonInteraction: inputButtonInteraction,
            content: 'Would you like to pick an Ability manually?',
            component: this.getYesNoButtonRowComponent(),
        });

        let buttonInteraction: ButtonInteraction | undefined;
        await ButtonStrategy.handleButtonInteractions({
            interactionResponse: message!,
            commandName: `/ptu ${this.key}`,
            restartStyle: ButtonListenerRestartStyle.Never,
            onButtonPress: async (buttonInteractionOnPress) =>
            {
                buttonInteraction = buttonInteractionOnPress;
                const key = buttonInteraction.customId as BreedPokemonButtonName;
                const handlerMap: ButtonHandlerMap<BreedPokemonButtonName> = {
                    [BreedPokemonButtonName.Yes]: () =>
                    {
                        shouldPickAbilityManually = true;
                    },
                    [BreedPokemonButtonName.No]: async () =>
                    {
                        // No-Op. This is already handled
                        // at the start of the function.
                    },
                };

                await handlerMap[key]();
            },
            getButtonRowComponent: () => this.getYesNoButtonRowComponent(),
        });

        return { shouldPickAbilityManually, buttonInteraction };
    }

    private static async getGender(
        interaction: ChatInputCommandInteraction,
        pokemonEducationRank: number,
        message: Message | undefined,
        inputButtonInteraction: ButtonInteraction | undefined,
    ): Promise<GetGenderResult>
    {
        // Get gender roll
        const roll: number = this.rollGender();

        if (pokemonEducationRank < 6)
        {
            return { roll };
        }

        // Ask if the user wants to manually pick
        await this.updateMessage({
            interaction,
            buttonInteraction: inputButtonInteraction,
            content: 'What Gender would you like?',
            component: this.getGenderButtonRowComponent(),
        });

        let buttonInteraction: ButtonInteraction | undefined;
        let gender: PokemonGender | undefined;
        await ButtonStrategy.handleButtonInteractions({
            interactionResponse: message!,
            commandName: `/ptu ${this.key}`,
            restartStyle: ButtonListenerRestartStyle.Never,
            onButtonPress: async (buttonInteractionOnPress) =>
            {
                buttonInteraction = buttonInteractionOnPress;
                const key = buttonInteraction.customId as PokemonGender;
                const handlerMap: ButtonHandlerMap<PokemonGender | 'Random'> = {
                    [PokemonGender.Male]: () =>
                    {
                        gender = PokemonGender.Male;
                    },
                    [PokemonGender.Female]: () =>
                    {
                        gender = PokemonGender.Female;
                    },
                    Random: () =>
                    {
                        // No-Op. This is already handled
                        // at the start of the function.
                    },
                };

                await handlerMap[key]();
            },
            getButtonRowComponent: () => this.getGenderButtonRowComponent(),
        });

        if (gender === undefined)
        {
            return { roll };
        }

        return { gender };
    }

    private static async updateMessage({
        interaction,
        buttonInteraction,
        content,
        component,
    }: {
        interaction: ChatInputCommandInteraction;
        buttonInteraction?: ButtonInteraction;
        content: string;
        component: ActionRowBuilder<ButtonBuilder>;
    }): Promise<Message | undefined>
    {
        if (buttonInteraction === undefined)
        {
            return await interaction.editReply({
                content,
                components: [component],
            });
        }

        await buttonInteraction.update({
            content,
            components: [component],
        });
        return undefined;
    }

    private static rollSpecies(maleSpecies: string, femaleSpecies: string): RollSpeciesResult
    {
        const roll = new DiceLiteService({
            count: 1,
            sides: 20,
        })
            .roll()
            .reduce((acc, cur) =>
                (acc + cur), 0,
            );

        const speciesResult = (roll >= 5)
            ? femaleSpecies
            : maleSpecies;

        return {
            species: speciesResult,
            roll,
        };
    }

    private static rollShiny(): RollShinyResult
    {
        const roll = new DiceLiteService({
            count: 1,
            sides: 100,
        })
            .roll()
            .reduce((acc, cur) =>
                (acc + cur), 0,
            );

        return {
            isShiny: (roll === 1 || roll === 100),
            roll,
        };
    }

    /* istanbul ignore next */
    private static rollGender(): number
    {
        const roll = new DiceLiteService({
            count: 1,
            sides: 100,
        })
            .roll()
            .reduce((acc, cur) =>
                (acc + cur), 0,
            );

        return roll;
    }

    /* istanbul ignore next */
    private static getYesNoButtonRowComponent(): ActionRowBuilder<ButtonBuilder>
    {
        const yesButton = new ButtonBuilder()
            .setCustomId(BreedPokemonButtonName.Yes)
            .setEmoji('✅')
            .setStyle(ButtonStyle.Secondary);

        const noButton = new ButtonBuilder()
            .setCustomId(BreedPokemonButtonName.No)
            .setEmoji('❌')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                yesButton,
                noButton,
            );

        return row;
    }

    /* istanbul ignore next */
    private static getGenderButtonRowComponent(): ActionRowBuilder<ButtonBuilder>
    {
        const maleButton = new ButtonBuilder()
            .setCustomId(PokemonGender.Male)
            .setEmoji('♂️')
            .setStyle(ButtonStyle.Secondary);

        const femaleButton = new ButtonBuilder()
            .setCustomId(PokemonGender.Female)
            .setEmoji('♀️')
            .setStyle(ButtonStyle.Secondary);

        const randomButton = new ButtonBuilder()
            .setCustomId('Random')
            .setEmoji('🎲')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                maleButton,
                femaleButton,
                randomButton,
            );

        return row;
    }
}
