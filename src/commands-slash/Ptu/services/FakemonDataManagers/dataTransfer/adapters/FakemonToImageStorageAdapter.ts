/* eslint-disable class-methods-use-this */

import { Adapter } from '../../../../../../services/DataTransfer/Adapter.js';
import { PtuFakemonCollection } from '../../../../dal/models/PtuFakemonCollection.js';

export class FakemonToImageStorageAdapter extends Adapter<PtuFakemonCollection, string | undefined>
{
    public transform(input: PtuFakemonCollection): string | undefined
    {
        return input.metadata.imageUrl;
    }
}
