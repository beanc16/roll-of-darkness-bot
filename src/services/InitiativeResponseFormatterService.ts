import { Text } from '@beanc16/discordjs-helpers';
import { ResponseFormatterService } from './ResponseFormatterService.js';
import { DicePoolGroup } from '../models/DicePoolGroup.js';

export class InitiativeResponseFormatterService extends ResponseFormatterService
{
    private rollResult: number;
    private initiativeModifier: number;
    private initiative: number;
    private name: string | null;

    constructor({
        authorId,
        dicePoolGroup,
        initiativeModifier,
        name,
    }: {
        authorId: string;
        dicePoolGroup: DicePoolGroup;
        initiativeModifier: number;
        name: string | null;
    })
    {
        super({
            authorId,
        });
        this.rollResult = dicePoolGroup.getBiggestResult().rolls[0][0].number;
        this.initiativeModifier = initiativeModifier;
        this.initiative = this.rollResult + this.initiativeModifier;
        this.name = name;
    }

    getResponse()
    {
        const optionalPlusSign = (this.initiativeModifier > 0) ? '+' : '';
        const rollName = (this.name) ? ` for ${this.name}` : '';

        const initialInfo = `${this.authorPing} rolled a ${this.rollResult} with a ${optionalPlusSign}${this.initiativeModifier} initiative modifier${rollName}.`;
        return `${initialInfo}\n\n${Text.bold(`Initiative of ${this.initiative}`)}`;
    }
}
