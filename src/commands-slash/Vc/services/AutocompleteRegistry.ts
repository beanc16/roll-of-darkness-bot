import { FileStorageGetFilesInFolderResponse } from '@beanc16/file-storage';

import { HandlerRegistry } from '../../../services/Registry/HandlerRegistry.js';
import { VcViewFilesStrategy } from '../strategies/VcViewFilesStrategy.js';
import { VcAutocompleteParameterName } from '../types.js';

export class AutocompleteRegistry extends HandlerRegistry<(discordUserId: string) => Promise<FileStorageGetFilesInFolderResponse>>
{
    constructor()
    {
        super({
            [VcAutocompleteParameterName.FileName]: (discordUserId: string) => VcViewFilesStrategy.getUserFiles(discordUserId),
        });
    }
}
