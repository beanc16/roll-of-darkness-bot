/* eslint-disable max-classes-per-file */

import type { AtLeastOne } from '@beanc16/utility-types';

import { PtuFakemonCollection, PtuFakemonStatus } from '../../dal/models/PtuFakemonCollection.js';
import { PokemonController } from '../../dal/PtuController.js';
import { FakemonController } from '../../dal/PtuFakemonController.js';
import { PtuFakemonPseudoCache } from '../../dal/PtuFakemonPseudoCache.js';

export enum FakemonDexNumberPrefix
{
    /** Base canonical pokedex */
    // Canon = '#', // This exists in the output, but we don't need it. Documenting it for future reference.
    /** Eden homebrew pokedex */
    Eden = '#E',
    /** Eden paradox pokedex */
    EdenParadox = '#EP',
    /** Eden drained pokedex */
    EdenDrained = '#ED',
    /** Eden legendary pokedex */
    EdenLegendary = '#EL',
}

/* istanbul ignore next */
class MaxDexNumberAggregateResult
{
    public maxNumber: number;
    public prefix: string;

    constructor(args: { maxNumber: number; prefix: string })
    {
        this.maxNumber = args.maxNumber;
        this.prefix = args.prefix;
    }
}

export class FakemonGeneralInformationManagerService
{
    private static allStatuses = new Set(Object.values(PtuFakemonStatus));

    public static async updateSpeciesName({
        messageId,
        fakemon,
        name,
    }: {
        messageId: string;
        fakemon: PtuFakemonCollection;
        name: string;
    }): Promise<PtuFakemonCollection>
    {
        if (name.trim().length === 0)
        {
            throw new Error('Fakemon name cannot be empty');
        }

        return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
            name,
        });
    }

    public static async updateStatus({
        messageId,
        fakemon,
        status,
    }: {
        messageId?: string;
        fakemon: PtuFakemonCollection;
        status: PtuFakemonStatus;
    }): Promise<PtuFakemonCollection>
    {
        if (!this.allStatuses.has(status))
        {
            throw new Error(`Invalid status: ${status}`);
        }

        if (messageId)
        {
            return await PtuFakemonPseudoCache.update(messageId, { id: fakemon.id }, {
                status,
            });
        }

        const {
            results: {
                new: output,
            },
        } = await FakemonController.findOneAndUpdate({
            _id: fakemon.id,
        }, { status }) as {
            results: {
                new: PtuFakemonCollection;
            };
        };

        return output;
    }

    public static async updateTransferredTo({ fakemon, transferredTo }: {
        fakemon: PtuFakemonCollection;
        transferredTo: AtLeastOne<
            Omit<PtuFakemonCollection['transferredTo'], 'googleSheets'>
            & { googleSheets: AtLeastOne<PtuFakemonCollection['transferredTo']['googleSheets']> }
        >;
    }): Promise<PtuFakemonCollection>
    {
        const updateData: Record<string, boolean> = {};

        if (transferredTo.ptuDatabase !== undefined)
        {
            updateData['transferredTo.ptuDatabase'] = transferredTo.ptuDatabase;
        }
        if (transferredTo.imageStorage !== undefined)
        {
            updateData['transferredTo.imageStorage'] = transferredTo.imageStorage;
        }
        if (transferredTo.googleSheets?.pokemonData !== undefined)
        {
            updateData['transferredTo.googleSheets.pokemonData'] = transferredTo.googleSheets.pokemonData;
        }
        if (transferredTo.googleSheets?.pokemonSkills !== undefined)
        {
            updateData['transferredTo.googleSheets.pokemonSkills'] = transferredTo.googleSheets.pokemonSkills;
        }

        const {
            results: {
                new: output,
            },
        } = await FakemonController.findOneAndUpdate({
            _id: fakemon.id,
        }, updateData) as {
            results: {
                new: PtuFakemonCollection;
            };
        };

        return output;
    }

    public static async getCurrentMaxDexNumbers(): Promise<Record<FakemonDexNumberPrefix, number>>
    {
        const { results = [] } = await PokemonController.aggregate([
            // Only dexNumbers that start with "#"
            {
                $match: {
                    'metadata.dexNumber': { $regex: /^#/ },
                },
            },

            // Parse prefix + numeric part
            {
                $set: {
                    parsed: {
                        $regexFind: {
                            input: '$metadata.dexNumber',
                            // Group 1 = prefix, Group 2 = number
                            regex: /^(#[A-Z]*)(\d+)/,
                        },
                    },
                },
            },

            // Discard things like "#E???"
            {
                $match: {
                    'parsed.captures': { $ne: null },
                },
            },

            // Extract fields safely
            {
                $set: {
                    prefix: { $arrayElemAt: ['$parsed.captures', 0] },
                    number: {
                        $toInt: { $arrayElemAt: ['$parsed.captures', 1] },
                    },
                },
            },

            // Group by prefix, find max numeric value
            {
                $group: {
                    _id: '$prefix',
                    maxNumber: { $max: '$number' },
                },
            },

            // Pretty output
            {
                $project: {
                    _id: 0,
                    prefix: '$_id',
                    maxNumber: 1,
                },
            },

            // Sort by prefix
            {
                $sort: { prefix: 1 },
            },
        ], {
            Model: MaxDexNumberAggregateResult,
        }) as {
            results: MaxDexNumberAggregateResult[];
        };

        return results.reduce((acc, { prefix, maxNumber }) =>
        {
            acc[prefix as FakemonDexNumberPrefix] = maxNumber;
            return acc;
        }, {} as Record<FakemonDexNumberPrefix, number>);
    }
}
