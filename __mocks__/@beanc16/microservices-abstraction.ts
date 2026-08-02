export const GoogleSheetsMicroservice = jest.fn();

export enum GoogleSheetsMicroserviceFilterType
{
    CaseInsensitiveExcludes = 'case_insensitive_excludes',
}

export const UserMicroservice = {
    v1: {
        getServiceToServiceAuthToken: jest.fn().mockImplementation(() =>
        {
            return {
                data: {
                    token: 'token',
                },
            };
        }),
    },
};
