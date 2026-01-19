export class FileStorageService
{
    static get = jest.fn();
    static upload = jest.fn();
    static rename = jest.fn();
    static delete = jest.fn();
}

export enum FileStorageResourceType
{
    Audio = 'video',
    Image = 'image',
    Video = 'video',
}
