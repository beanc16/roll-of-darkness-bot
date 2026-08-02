export enum DiscordInteractionCallbackType
{
    Dm = 'dm',
    EditReply = 'editReply',
    Followup = 'followUp',
    Update = 'update',
}

export enum DiscordUserId
{
    Bean = '173083328302284800',
    Avery = '389188261731368962',
    Josh = '125738013841031170',
    Cody = '483775349197373460',
    Ash = '392769259756847116',
    Joel = '191607823292039169',
}

export type CommandName = `/${string}`;

export const STRING_SELECT_ACTION_ROW_MAX_OPTIONS = 25;
