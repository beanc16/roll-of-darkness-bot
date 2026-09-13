import { Adapter } from '../../../../services/DataTransfer/Adapter.js';
import { PtuMoveCollection } from '../../dal/models/PtuMoveCollection.js';
import { PtuMove } from '../../models/PtuMove.js';
import { PtuValidationService } from './PtuValidationService.js';

export class PtuMoveCollectionToPtuAdapter extends Adapter<PtuMoveCollection, PtuMove>
{
    /* eslint-disable-next-line class-methods-use-this */
    public transform(input: PtuMoveCollection): PtuMove
    {
        PtuValidationService.validate(input, { allowSpecificOptionalFields: true });

        return new PtuMove([
            input.name,
            '', // Blank-Fill: Type Icon
            '', // Blank-Fill: Category Icon
            input.damageBase.toString(),
            input.frequency.toString(),
            input.ac.toString(),
            input.effects ?? '--',
            (input.contestStatEffect && input.contestStatType)
                ? `${input.contestStatType} - ${input.contestStatEffect}`
                : '',
            input.category.toString(),
            input.type.toString(),
            '', // Blank-Fill: Unnecessary 'o' field for specific ability synergy or lack thereof
            '', // Blank-Fill: Unnecessary 'o' field for specific ability synergy or lack thereof
            '', // Blank-Fill: Unnecessary 'o' field for specific ability synergy or lack thereof
            '', // Blank-Fill: Unnecessary 'o' field for specific ability synergy or lack thereof
            '', // Blank-Fill: Unnecessary 'o' field for specific ability synergy or lack thereof
            '', // Blank-Fill: Unnecessary 'o' field for specific ability synergy or lack thereof
            '', // Blank-Fill: Unnecessary 'o' field for specific ability synergy or lack thereof
            '', // Blank-Fill: Unnecessary 'o' field for specific ability synergy or lack thereof
            '', // Blank-Fill: Unnecessary 'o' field for specific ability synergy or lack thereof
            input.basedOn ?? '',
        ]);
    }
}
