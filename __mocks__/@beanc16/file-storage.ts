export class FileStorageService
{
    public static get = jest.fn();
    public static upload = jest.fn();
    public static rename = jest.fn();
    public static delete = jest.fn();
}

export enum FileStorageResourceType
{
    Audio = 'video',
    Image = 'image',
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    Video = 'video',
}
