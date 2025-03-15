import { ChatInputCommandInteraction } from 'discord.js';

import rollConstants from '../../../constants/roll.js';
import { DiceService } from '../../../services/DiceService.js';
import { CommandName, DiscordInteractionCallbackType } from '../../../types/discord.js';
import { OnRerollCallbackOptions, RerollStrategy } from '../../strategies/RerollStrategy.js';
import RollResponseFormatterService from '../services/RollResponseFormatterService.js';

export class BaseRollStrategy
{
    public static async run({
        interaction,
        numberOfDice = interaction.options.getInteger('number_of_dice'),
        commandName,
        rerollCallbackOptions = {
            interactionCallbackType: DiscordInteractionCallbackType.EditReply,
        },
    }: {
        interaction: ChatInputCommandInteraction;
        numberOfDice: number | null;
        commandName: CommandName;
        rerollCallbackOptions?: OnRerollCallbackOptions;
    }): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString('name');
        const rerollsKey = interaction.options.getString('rerolls') as keyof typeof rollConstants.rerollsEnum | null;
        const isRote = interaction.options.getBoolean('rote');
        const exceptionalOn = interaction.options.getInteger('exceptional_on');
        const diceToReroll = interaction.options.getInteger('dice_to_reroll');
        const isAdvancedAction = interaction.options.getBoolean('advanced_action');
        const extraSuccesses = interaction.options.getInteger('extra_successes');

        // Convert parameters to necessary inputs for service calls
        const rerollOnGreaterThanOrEqualTo = (rerollsKey)
            ? rollConstants.rerollsEnum[rerollsKey]?.number
            : undefined;
        const rerollsDisplay = (rerollsKey)
            ? rollConstants.rerollsEnum[rerollsKey]?.display
            : undefined;

        // Roll the dice
        const diceService = new DiceService({
            count: numberOfDice,
            rerollOnGreaterThanOrEqualTo,
            diceToReroll,
            isRote,
            isAdvancedAction,
            extraSuccesses,
        });
        const dicePoolGroup = diceService.roll();

        // Response
        const rollResponseFormatterService = new RollResponseFormatterService({
            authorId: rerollCallbackOptions?.newCallingUserId ?? interaction.user.id,
            dicePoolGroup,
            diceToReroll,
            exceptionalOn,
            extraSuccesses,
            isAdvancedAction,
            isRote,
            name,
            numberOfDice,
            rerollsDisplay,
        });
        await RerollStrategy.run({
            interaction,
            options: rollResponseFormatterService.getResponse(),
            rerollCallbackOptions,
            onRerollCallback: newRerollCallbackOptions => this.run({
                interaction,
                numberOfDice,
                commandName,
                rerollCallbackOptions: newRerollCallbackOptions,
            }),
            commandName,
        });

        return true;
    }
}
