import { FileStorageGetFilesInFolderResponse } from '@beanc16/file-storage';

import { HandlerRegistry } from '../../../services/Registry/HandlerRegistry.js';
import { VcViewFilesStrategy } from '../strategies/VcViewFilesStrategy.js';
import { VcAutocompleteParameterName } from '../types.js';

export class VcAutocompleteRegistry extends HandlerRegistry<(discordUserId: string) => Promise<FileStorageGetFilesInFolderResponse>>
{
    constructor()
    {
        super({});

        const fileNameParams = [
            VcAutocompleteParameterName.FileName,
            ...Array.from({ length: 10 }, (_, index) => VcAutocompleteParameterName.FileName + `_${index + 1}`),
        ];

        this.register(fileNameParams, (discordUserId: string) => VcViewFilesStrategy.getUserFiles(discordUserId));
    }
}
