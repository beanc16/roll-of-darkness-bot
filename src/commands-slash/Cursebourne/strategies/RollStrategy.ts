import { ChatInputCommandInteraction } from 'discord.js';

import { ChatIteractionStrategy } from '../../strategies/ChatIteractionStrategy.js';
import { staticImplements } from '../../../decorators/staticImplements.js';
import { CursebourneSubcommand } from '../subcommand-groups/index.js';
import { TwoSuccessesOption } from '../subcommand-groups/roll.js';
import { CursebourneDiceService } from '../services/CursebourneDiceService.js';
import { Text } from '@beanc16/discordjs-helpers';

@staticImplements<ChatIteractionStrategy>()
export class RollStrategy
{
    public static key = CursebourneSubcommand.Roll;

    static async run(
        interaction: ChatInputCommandInteraction,
    ): Promise<boolean>
    {
        // Get parameter results
        const numberOfDice = interaction.options.getInteger('number_of_dice', true);
        const name = interaction.options.getString('name');
        const enhancements = interaction.options.getInteger('enhancements') ?? 0;
        const successesKey = interaction.options.getString('two_successes') as TwoSuccessesOption | null;

        // Convert parameters to necessary inputs for service calls
        const twoSuccessesOn = this.getTwoSuccessesOn(successesKey);

        // Roll the dice
        const diceService = new CursebourneDiceService({
            count: numberOfDice,
            twoSuccessesOn,
            enhancements,
        });
        const {
            numOfSuccesses,
            rollResults,
        } = diceService.roll();

        // Send message
        const response = this.getResponse({
            interaction,
            numberOfDice,
            successesKey,
            enhancements,
            name,
            numOfSuccesses,
            rollResults,
        });
        await interaction.editReply(response);

        return true;
    }

    private static getTwoSuccessesOn(twoSuccessesOn: TwoSuccessesOption | null): number
    {
        if (twoSuccessesOn === TwoSuccessesOption.DoubleTens)
        {
            return 10;
        }

        else if (twoSuccessesOn === TwoSuccessesOption.DoubleNines)
        {
            return 9;
        }

        else if (twoSuccessesOn === TwoSuccessesOption.NoDoubles)
        {
            return 100;
        }

        return 10;
    }

    private static getResponse({
        interaction,
        numberOfDice,
        successesKey,
        enhancements,
        name,
        numOfSuccesses,
        rollResults,
    }: {
        interaction: ChatInputCommandInteraction;
        numberOfDice: number;
        enhancements: number;
        successesKey: TwoSuccessesOption | null;
        name: string | null;
        numOfSuccesses: number;
        rollResults: number[];
    }): string
    {
        const againString = (successesKey === TwoSuccessesOption.DoubleNines)
            ? 'double 9s'
            : (successesKey === TwoSuccessesOption.NoDoubles)
            ? 'no double 10s'
            : '';

        const enhancementsString = (enhancements > 0)
            ? `${enhancements} enhancements`
            : '';

        const rollName = (name) ? ` for ${name}` : '';
        const successesAsSingularOrPlural = (numOfSuccesses !== 1)
            ? 'successes'
            : 'success';

        return `${Text.Ping.user(interaction.user.id)} rolled ${numberOfDice} dice${
            this.getCombinedExtrasString(againString, enhancementsString)
        }${rollName}.\n\n` +
            Text.bold(`${numOfSuccesses} ${successesAsSingularOrPlural}`) + '\n' +
            rollResults.join(', ');
    }

    private static getCombinedExtrasString(...extras: string[]): string
    {
        let output = ' with ';

        if (extras.length > 2)
        {
            output += extras.join(', ');
            const indexOfLastComma = output.lastIndexOf(', ');

            return output.slice(0, indexOfLastComma + 1) + ' and' + output.slice(indexOfLastComma + 1);
        }

        if (extras.length > 0)
        {
            return output + extras.join(' and ');
        }

        return '';
    }
}
