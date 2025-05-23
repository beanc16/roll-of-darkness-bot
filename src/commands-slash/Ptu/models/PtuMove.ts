import { logger } from '@beanc16/logger';

import { EnumParserService } from '../../../services/EnumParserService.js';
import { EqualityOption } from '../../options/shared.js';
import { GetLookupMoveDataParameters } from '../types/modelParameters.js';
import {
    PokemonMoveCategory,
    PokemonType,
    PtuContestStatEffect,
    PtuContestStatType,
    PtuMoveFrequency,
} from '../types/pokemon.js';

export interface PtuMoveIsValidBasedOnInputParameters extends Omit<GetLookupMoveDataParameters, 'names'>
{
    names?: Set<string>;
}

export class PtuMove
{
    public name: string;
    public type?: PokemonType;
    public category?: PokemonMoveCategory;
    public frequency?: PtuMoveFrequency;
    public damageBase?: number;
    public ac?: number;
    public range?: string;
    public effects: string;
    public contestStatEffect?: PtuContestStatEffect;
    public contestStatType?: PtuContestStatType;
    public basedOn?: string;
    public uses: {
        sheerForce: boolean;
        toughClaws: boolean;
        technician: boolean;
        reckless: boolean;
        ironFist: boolean;
        megaLauncher: boolean;
        megaLauncherErrata: boolean;
        punkRock: boolean;
        strongJaw: boolean;
        recklessErrata: boolean;
    };

    constructor(input: string[])
    {
        const [
            name,
            _typeIcon,
            _categoryIcon,
            untrimmedDamageBase,
            untrimmedFrequency,
            untrimmedAc,
            range,
            effects,
            contestStats,
            untrimmedCategory,
            untrimmedType,
            sheerForce,
            toughClaws,
            technician,
            reckless,
            ironFist,
            megaLauncher,
            megaLauncherErrata,
            punkRock,
            strongJaw,
            recklessErrata,
            basedOn,
        ] = input;

        // Trim strings with necessary validation
        const unparsedRange = range?.trim();
        const unparsedDamageBase = untrimmedDamageBase?.trim();
        const frequency = untrimmedFrequency?.trim();
        const unparsedAc = untrimmedAc?.trim();
        const category = untrimmedCategory?.trim();
        const type = untrimmedType?.trim();

        // Parse numbers
        const damageBase = parseInt(unparsedDamageBase, 10);
        const ac = parseInt(unparsedAc, 10);

        // Parse contest stats
        const [contestStatType, contestStatEffect] = contestStats?.trim()?.split('-')?.map(value => value.trim()) ?? [];

        // Base values
        this.name = name?.trim();
        this.effects = effects?.trim();
        this.basedOn = basedOn?.trim();
        this.contestStatType = (contestStatType !== '--' && contestStatType !== '')
            ? contestStatType as PtuContestStatType
            : undefined;
        this.contestStatEffect = (contestStatEffect !== '--' && contestStatEffect !== '')
            ? contestStatEffect as PtuContestStatEffect
            : undefined;
        this.uses = {
            sheerForce: sheerForce === 'o',
            toughClaws: toughClaws === 'o',
            technician: technician === 'o',
            reckless: reckless === 'o',
            ironFist: ironFist === 'o',
            megaLauncher: megaLauncher === 'o',
            megaLauncherErrata: megaLauncherErrata === 'o',
            punkRock: punkRock === 'o',
            strongJaw: strongJaw === 'o',
            recklessErrata: recklessErrata === 'o',
        };

        // ---> TODO: Convert these validation if statements to use JOI later.
        // Category
        if (EnumParserService.isInEnum(PokemonMoveCategory, category))
        {
            this.category = category as PokemonMoveCategory;
        }
        else if (category && category !== 'Category' && category !== '--' && category !== '')
        {
            logger.warn('Received a move with an invalid category', { category, validCategories: Object.values(PokemonMoveCategory) });
        }

        // Type
        if (EnumParserService.isInEnum(PokemonType, type))
        {
            this.type = type as PokemonType;
        }
        else if (type && type !== 'Type' && type !== 'See Effect' && type !== '--' && type !== '' && type !== undefined)
        {
            logger.warn('Received a move with an invalid type', { type, validTypes: Object.values(PokemonType) });
        }

        // Frequency
        if (EnumParserService.isInEnum(PtuMoveFrequency, frequency))
        {
            this.frequency = frequency as PtuMoveFrequency;
        }
        else if (frequency && frequency !== 'Frequency' && frequency !== '--' && frequency !== 'See Effect' && frequency !== 'Action' && frequency !== '')
        {
            logger.warn('Received a move with an invalid frequency', { frequency, validInputs: Object.values(PtuMoveFrequency) });
        }

        // Damage Base
        if (!(unparsedDamageBase === '--' || Number.isNaN(damageBase)))
        {
            this.damageBase = damageBase;
        }
        else if (unparsedDamageBase && unparsedDamageBase !== '--' && unparsedDamageBase !== '-' && unparsedDamageBase !== 'Damage base' && unparsedDamageBase !== 'See Effect' && unparsedDamageBase !== 'X, See Effect' && unparsedDamageBase !== '')
        {
            /* istanbul ignore next */
            logger.warn('Received a move with a damage base that is not a number', { unparsedDamageBase, damageBase });
        }

        // AC
        if (!(unparsedAc === '--' || Number.isNaN(ac)))
        {
            this.ac = ac;
        }
        else if (unparsedAc && unparsedAc !== '--' && unparsedAc !== 'AC' && unparsedAc !== 'See Effect' && unparsedAc !== '')
        {
            /* istanbul ignore next */
            logger.warn('Received a move with an AC that is not a number', { unparsedAc, ac });
        }

        // Range
        if (unparsedRange !== '--')
        {
            this.range = unparsedRange;
        }
        // <--- TODO: Convert these validation if statements to use JOI later.
    }

    /* istanbul ignore next */
    public ShouldIncludeInOutput(): boolean
    {
        // Moves to not include
        const blacklist = [
            '',
            'Name',
            'Maneuver',
            'MH Adept',
            'MH Expert',
            'OH Adept',
            'EW Adept',
            'EW Expert',
        ];

        if (blacklist.includes(this.name))
        {
            return false;
        }

        return true;
    }

    public IsValidBasedOnInput(input: PtuMoveIsValidBasedOnInputParameters): boolean
    {
        // Name
        if (!this.name)
        {
            return false;
        }
        if (input.names && input.names.size > 0 && !input.names.has(this.name.toLowerCase()) && !input.includeAllIfNoName)
        {
            return false;
        }

        // Type
        if (input.type && input.type !== this.type)
        {
            return false;
        }

        // Category
        if (input.category && input.category !== this.category)
        {
            return false;
        }

        // Damage Base
        if (input.db)
        {
            if (this.damageBase === undefined) return false;
            switch (input.dbEquality)
            {
            case EqualityOption.GreaterThanOrEqualTo:
                if (!(this.damageBase >= input.db)) return false;
                break;
            case EqualityOption.GreaterThan:
                if (!(this.damageBase > input.db)) return false;
                break;
            case EqualityOption.LessThanOrEqualTo:
                if (!(this.damageBase <= input.db)) return false;
                break;
            case EqualityOption.LessThan:
                if (!(this.damageBase < input.db)) return false;
                break;
            case EqualityOption.NotEqualTo:
                if (!(this.damageBase !== input.db)) return false;
                break;
            case EqualityOption.Equal:
            default:
                if (!(this.damageBase === input.db)) return false;
            }
        }

        // Frequency
        if (input.frequency && input.frequency !== this.frequency)
        {
            return false;
        }

        // AC
        if (input.ac)
        {
            if (this.ac === undefined) return false;
            switch (input.acEquality)
            {
            case EqualityOption.GreaterThanOrEqualTo:
                if (!(this.ac >= input.ac)) return false;
                break;
            case EqualityOption.GreaterThan:
                if (!(this.ac > input.ac)) return false;
                break;
            case EqualityOption.LessThanOrEqualTo:
                if (!(this.ac <= input.ac)) return false;
                break;
            case EqualityOption.LessThan:
                if (!(this.ac < input.ac)) return false;
                break;
            case EqualityOption.NotEqualTo:
                if (!(this.ac !== input.ac)) return false;
                break;
            case EqualityOption.Equal:
            default:
                if (!(this.ac === input.ac)) return false;
            }
        }

        // Contest Stats
        if (
            (input.contestStatType && this.contestStatType && input.contestStatType !== this.contestStatType.toString())
            || (input.contestStatType && !this.contestStatType)
        )
        {
            return false;
        }

        if (
            (input.contestStatEffect && this.contestStatEffect && input.contestStatEffect !== this.contestStatEffect.toString())
            || (input.contestStatEffect && !this.contestStatEffect)
        )
        {
            return false;
        }

        // Based On
        if (input.basedOn && input.basedOn !== this.basedOn)
        {
            return false;
        }

        // Range
        if (input.rangeSearch && this.range && !this.range.toLowerCase().includes(input.rangeSearch.toLowerCase()))
        {
            return false;
        }

        // Exclude
        if (input.exclude)
        {
            if (input.exclude.names && input.exclude.names.some(name => name.toLowerCase() === this.name.toLowerCase())) return false;
            if (input.exclude.rangeSearch && this.range && this.range.toLowerCase().includes(input.exclude.rangeSearch.toLowerCase())) return false;
        }

        return true;
    }
}
