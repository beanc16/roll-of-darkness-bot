import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import {
    InitiativeModifier,
    NwodCalculateSubcommand,
    OpponentSpeed,
    Territory,
} from '../../options/calculate.js';

export interface CalculateSuccessesOptions
{
    opponentsSpeed: OpponentSpeed;
    initiativeModifier: InitiativeModifier;
    territory: Territory;
    opponentsTurnLead: number;
    sizeIsLowerThanOpponents: boolean;
    opponentCannotBeTired: boolean;
    environmentDangerModifier: number;
}

@staticImplements<ChatIteractionStrategy>()
export class CalculateChaseSuccessesStrategy
{
    public static key = NwodCalculateSubcommand.ChaseSuccesses;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const opponentsSpeed = interaction.options.getString('opponents_speed', true) as OpponentSpeed;
        const initiativeModifier = interaction.options.getString('initiative_modifier', true) as InitiativeModifier;
        const territory = interaction.options.getString('territory', true) as Territory;
        const opponentsTurnLead = interaction.options.getNumber('opponents_turn_lead') ?? 0;
        const sizeIsLowerThanOpponents = interaction.options.getBoolean('size_is_lower_than_opponents') ?? false;
        const opponentCannotBeTired = interaction.options.getBoolean('opponent_cannot_be_tired') ?? false;
        const environmentDangerModifier = interaction.options.getNumber('environment_danger_modifier') ?? 0;

        if (!(Number.isInteger(opponentsTurnLead) && Number.isInteger(environmentDangerModifier)))
        {
            const errorMessages = [
                ...(Number.isInteger(opponentsTurnLead) ? [] : ['opponents_turn_lead']),
                ...(Number.isInteger(environmentDangerModifier) ? [] : ['environment_danger_modifier']),
            ];

            await interaction.editReply({
                content: `${errorMessages.join(' and ')} must be an integer.`,
            });
            return true;
        }

        // Calculate successes
        const successes = this.calculateSuccesses({
            opponentsSpeed,
            initiativeModifier,
            territory,
            opponentsTurnLead,
            sizeIsLowerThanOpponents,
            opponentCannotBeTired,
            environmentDangerModifier,
        });

        // Send message
        await interaction.editReply({
            content: `You need a total of ${successes} successes to win this chase.`,
        });

        return true;
    }

    private static calculateSuccesses({
        opponentsSpeed,
        initiativeModifier,
        territory,
        opponentsTurnLead,
        sizeIsLowerThanOpponents,
        opponentCannotBeTired,
        environmentDangerModifier,
    }: CalculateSuccessesOptions): number
    {
        // Always start at a base of 5 successes
        const successes = 5;

        // Create num maps to modifiers
        const opponentsSpeedToModifier: Record<OpponentSpeed, number> = {
            [OpponentSpeed.HigherThanYours]: 1,
            [OpponentSpeed.TwiceYours]: 3,
            [OpponentSpeed.TenTimesYours]: 5,
            [OpponentSpeed.NoneOfTheAbove]: 0,
        };
        const initiativeModifierToModifier: Record<InitiativeModifier, number> = {
            [InitiativeModifier.HigherThanOpponents]: -1,
            [InitiativeModifier.TwiceOpponents]: -2,
            [InitiativeModifier.ThreeTimesOpponents]: -3,
            [InitiativeModifier.NoneOfTheAbove]: 0,
        };
        const territoryToModifier: Record<Territory, number> = {
            [Territory.Knows]: -1,
            [Territory.KnowsIntimately]: -3,
            [Territory.DoesntKnow]: 0,
        };

        // Get all modifiers (variables with a type of number are already modifiers)
        const opponentsSpeedModifier = opponentsSpeedToModifier[opponentsSpeed];
        const initiativeModifierModifier = initiativeModifierToModifier[initiativeModifier];
        const territoryModifier = territoryToModifier[territory];
        const sizeIsLowerThanOpponentsModifier = sizeIsLowerThanOpponents ? -1 : 0;
        const opponentCannotBeTiredModifier = opponentCannotBeTired ? 2 : 0;

        // Calculate successes
        return Math.max(0, successes
            + opponentsSpeedModifier
            + initiativeModifierModifier
            + territoryModifier
            + opponentsTurnLead
            + sizeIsLowerThanOpponentsModifier
            + opponentCannotBeTiredModifier
            + environmentDangerModifier);
    }
}
