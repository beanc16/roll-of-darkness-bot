import { randomUUID } from 'node:crypto';

import Discord from 'discord.js';

const generateFakeId = (): string => randomUUID();

/*
 * Builders
 */

export const ActionRowBuilder = jest.fn<Discord.ActionRowBuilder, []>().mockImplementation(() =>
{
    const result: Discord.ActionRowBuilder = {
        components: [],
        data: {},
        addComponents: jest.fn().mockImplementation((...components: Discord.AnyComponentBuilder[]) =>
        {
            result.components.push(...components);
            return result;
        }),
        setComponents: jest.fn().mockImplementation((...components: Discord.AnyComponentBuilder[]) =>
        {
            // Remove all elements, then add the new ones
            result.components.splice(0).push(...components);
            return result;
        }),
        toJSON: jest.fn(),
    };

    return result;
});

export const ButtonBuilder = jest.fn<Discord.ButtonBuilder, []>().mockImplementation(() =>
{
    const result: Discord.ButtonBuilder = {
        data: {
            disabled: false,
        },
        setCustomId: jest.fn().mockImplementation(() => result),
        setDisabled: jest.fn().mockImplementation((disabled: boolean) =>
        {
            result.data.disabled = disabled;
            return result;
        }),
        setEmoji: jest.fn().mockImplementation(() => result),
        setLabel: jest.fn().mockImplementation(() => result),
        setStyle: jest.fn().mockImplementation(() => result),
        setURL: jest.fn().mockImplementation(() => result),
        toJSON: jest.fn(),
    };

    return result;
});

export const EmbedBuilder = jest.fn<Discord.EmbedBuilder, []>().mockImplementation(() =>
{
    const result: Discord.EmbedBuilder = {
        data: {},
        addFields: jest.fn().mockImplementation(() => result),
        setAuthor: jest.fn().mockImplementation(() => result),
        setColor: jest.fn().mockImplementation(() => result),
        setDescription: jest.fn().mockImplementation(() => result),
        setFields: jest.fn().mockImplementation(() => result),
        setFooter: jest.fn().mockImplementation(() => result),
        setImage: jest.fn().mockImplementation(() => result),
        setThumbnail: jest.fn().mockImplementation(() => result),
        setTimestamp: jest.fn().mockImplementation(() => result),
        setTitle: jest.fn().mockImplementation(() => result),
        setURL: jest.fn().mockImplementation(() => result),
        spliceFields: jest.fn(),
        toJSON: jest.fn(),
    };

    return result;
});

export const StringSelectMenuBuilder = jest.fn<Discord.StringSelectMenuBuilder, []>().mockImplementation(() =>
{
    const result: Discord.StringSelectMenuBuilder = {
        data: {},
        options: [],
        addOptions: jest.fn().mockImplementation(() => result),
        setCustomId: jest.fn().mockImplementation(() => result),
        setDisabled: jest.fn().mockImplementation(() => result),
        setPlaceholder: jest.fn().mockImplementation(() => result),
        setMinValues: jest.fn().mockImplementation(() => result),
        setMaxValues: jest.fn().mockImplementation(() => result),
        setOptions: jest.fn().mockImplementation(() => result),
        spliceOptions: jest.fn(),
        toJSON: jest.fn(),
    };

    return result;
});

export const StringSelectMenuOptionBuilder = jest.fn<Discord.StringSelectMenuOptionBuilder, []>().mockImplementation(() =>
{
    const result: Discord.StringSelectMenuOptionBuilder = {
        data: {},
        setDefault: jest.fn().mockImplementation(() => result),
        setDescription: jest.fn().mockImplementation(() => result),
        setEmoji: jest.fn().mockImplementation(() => result),
        setLabel: jest.fn().mockImplementation(() => result),
        setValue: jest.fn().mockImplementation(() => result),
        toJSON: jest.fn(),
    };

    return result;
});

/*
 * Clients
 */

export const Client = jest.fn<Discord.Client, []>().mockImplementation(() =>
{
    const result: Discord.Client = {
        login: jest.fn<Promise<string>, [string?]>().mockResolvedValue('Logged in'),
    } as unknown as Discord.Client; // TODO: Remove this typecast once all required properties are added

    return result;
});

export const WebhookClient = jest.fn().mockImplementation(() =>
{
    return {
        editMessage: jest.fn(),
        fetchMessage: jest.fn(),
        send: jest.fn(),
    };
});

/*
 * Components
 */

export const AttachmentPayload = jest.fn().mockImplementation(() =>
{
    return {
        attachment: 'fake-attachment',
        name: 'fake-name',
        description: 'fake-description',
    };
});

export const Message = jest.fn<Discord.Message, []>().mockImplementation(() =>
{
    const output: Discord.Message = {
        content: 'fake-content',
        author: { bot: false },
        awaitMessageComponent: jest.fn(),
        delete: jest.fn(),
        edit: jest.fn(),
        reply: jest.fn(),
    } as unknown as Discord.Message; // TODO: Remove this typecast once all required properties are added

    return output;
});

export const User = jest.fn<Discord.User, []>().mockImplementation(() =>
{
    const output: Discord.User = {
        id: generateFakeId(),
        bot: false,
        system: false,
        username: 'fake-username',
        discriminator: '0000',
    } as unknown as Discord.User;

    return output;
});

/*
 * Interactions
 */

export const ButtonInteraction = jest.fn<Discord.ButtonInteraction, []>().mockImplementation(() =>
{
    const result: Discord.ButtonInteraction = {
        deferReply: jest.fn(),
        deferUpdate: jest.fn(),
        deleteReply: jest.fn(),
        editReply: jest.fn(),
        fetchReply: jest.fn(),
        followUp: jest.fn(),
        reply: jest.fn(),
        update: jest.fn(),
        showModal: jest.fn(),
    } as unknown as Discord.ButtonInteraction; // TODO: Remove this typecast once all required properties are added

    return result;
});

export const ChatInputCommandInteraction = jest.fn<Discord.ChatInputCommandInteraction, []>().mockImplementation(() =>
{
    const result: Discord.ChatInputCommandInteraction = {
        isCommand: jest.fn(() => true),
        commandName: 'fake-command-name',
        options: {
            getSubcommand: jest.fn<string | null, [boolean?]>(),
            getSubcommandGroup: jest.fn<string | null, [boolean?]>(),
            getBoolean: jest.fn<boolean | null, [boolean?]>(),
            getString: jest.fn<string | null, [boolean?]>(),
            getInteger: jest.fn<number | null, [boolean?]>(),
            getNumber: jest.fn<number | null, [boolean?]>(),
        },
        deferReply: jest.fn(),
        deleteReply: jest.fn(),
        editReply: jest.fn(),
        fetchReply: jest.fn(),
        followUp: jest.fn(),
        reply: jest.fn(),
        showModal: jest.fn(),
    } as unknown as Discord.ChatInputCommandInteraction; // TODO: Remove this typecast once all required properties are added

    return result;
});

export const Interaction = jest.fn().mockImplementation(() =>
{
    return {
        isCommand: jest.fn(() => true),
        commandName: '',
        reply: jest.fn(),
    };
});

export const StringSelectMenuInteraction = jest.fn<Discord.StringSelectMenuInteraction, []>().mockImplementation(() =>
{
    const result: Discord.StringSelectMenuInteraction = {
        deferReply: jest.fn(),
        deferUpdate: jest.fn(),
        deleteReply: jest.fn(),
        editReply: jest.fn(),
        fetchReply: jest.fn(),
        followUp: jest.fn(),
        reply: jest.fn(),
        update: jest.fn(),
        showModal: jest.fn(),
    } as unknown as Discord.StringSelectMenuInteraction; // TODO: Remove this typecast once all required properties are added

    return result;
});

/*
 * Types
 */

export enum ButtonStyle
{
    Primary = 1,
    Secondary = 2,
    Success = 3,
    Danger = 4,
    Link = 5,
}

export enum ComponentType
{
    ActionRow = 1,
    Button = 2,
    StringSelect = 3,
    TextInput = 4,
    UserSelect = 5,
    RoleSelect = 6,
    MentionableSelect = 7,
    ChannelSelect = 8,
}

export enum TextInputStyle
{
    Short = 1,
    Paragraph = 2,
};

export enum RESTJSONErrorCodes
{
    GeneralError = 0,
    UnknownAccount = 10001,
    UnknownApplication = 10002,
    UnknownChannel = 10003,
    UnknownGuild = 10004,
    UnknownIntegration = 10005,
    UnknownInvite = 10006,
    UnknownMember = 10007,
    UnknownMessage = 10008,
    UnknownPermissionOverwrite = 10009,
    UnknownProvider = 10010,
    UnknownRole = 10011,
    UnknownToken = 10012,
    UnknownUser = 10013,
    UnknownEmoji = 10014,
    UnknownWebhook = 10015,
    UnknownWebhookService = 10016,
    UnknownSession = 10020,
    UnknownBan = 10026,
    UnknownSKU = 10027,
    UnknownStoreListing = 10028,
    UnknownEntitlement = 10029,
    UnknownBuild = 10030,
    UnknownLobby = 10031,
    UnknownBranch = 10032,
    UnknownStoreDirectoryLayout = 10033,
    UnknownRedistributable = 10036,
    UnknownGiftCode = 10038,
    UnknownStream = 10049,
    UnknownPremiumServerSubscribeCooldown = 10050,
    UnknownGuildTemplate = 10057,
    UnknownDiscoverableServerCategory = 10059,
    UnknownSticker = 10060,
    UnknownInteraction = 10062,
    UnknownApplicationCommand = 10063,
    UnknownVoiceState = 10065,
    UnknownApplicationCommandPermissions = 10066,
    UnknownStageInstance = 10067,
    UnknownGuildMemberVerificationForm = 10068,
    UnknownGuildWelcomeScreen = 10069,
    UnknownGuildScheduledEvent = 10070,
    UnknownGuildScheduledEventUser = 10071,
    UnknownTag = 10087,
    BotsCannotUseThisEndpoint = 20001,
    OnlyBotsCanUseThisEndpoint = 20002,
    ExplicitContentCannotBeSentToTheDesiredRecipient = 20009,
    NotAuthorizedToPerformThisActionOnThisApplication = 20012,
    ActionCannotBePerformedDueToSlowmodeRateLimit = 20016,
    TheMazeIsntMeantForYou = 20017,
    OnlyTheOwnerOfThisAccountCanPerformThisAction = 20018,
    AnnouncementEditLimitExceeded = 20022,
    UnderMinimumAge = 20024,
    ChannelSendRateLimit = 20028,
    ServerSendRateLimit = 20029,
    StageTopicServerNameServerDescriptionOrChannelNamesContainDisallowedWords = 20031,
    GuildPremiumSubscriptionLevelTooLow = 20035,
    MaximumNumberOfGuildsReached = 30001,
    MaximumNumberOfFriendsReached = 30002,
    MaximumNumberOfPinsReachedForTheChannel = 30003,
    MaximumNumberOfRecipientsReached = 30004,
    MaximumNumberOfGuildRolesReached = 30005,
    MaximumNumberOfWebhooksReached = 30007,
    MaximumNumberOfEmojisReached = 30008,
    MaximumNumberOfReactionsReached = 30010,
    MaximumNumberOfGroupDMsReached = 30011,
    MaximumNumberOfGuildChannelsReached = 30013,
    MaximumNumberOfAttachmentsInAMessageReached = 30015,
    MaximumNumberOfInvitesReached = 30016,
    MaximumNumberOfAnimatedEmojisReached = 30018,
    MaximumNumberOfServerMembersReached = 30019,
    MaximumNumberOfServerCategoriesReached = 30030,
    GuildAlreadyHasTemplate = 30031,
    MaximumNumberOfApplicationCommandsReached = 30032,
    MaximumThreadParticipantsReached = 30033,
    MaximumDailyApplicationCommandCreatesReached = 30034,
    MaximumNumberOfNonGuildMemberBansHasBeenExceeded = 30035,
    MaximumNumberOfBanFetchesHasBeenReached = 30037,
    MaximumNumberOfUncompletedGuildScheduledEventsReached = 30038,
    MaximumNumberOfStickersReached = 30039,
    MaximumNumberOfPruneRequestsHasBeenReached = 30040,
    MaximumNumberOfGuildWidgetSettingsUpdatesHasBeenReached = 30042,
    MaximumNumberOfEditsToMessagesOlderThanOneHourReached = 30046,
    MaximumNumberOfPinnedThreadsInForumHasBeenReached = 30047,
    MaximumNumberOfTagsInForumHasBeenReached = 30048,
    BitrateIsTooHighForChannelOfThisType = 30052,
    MaximumNumberOfPremiumEmojisReached = 30056,
    MaximumNumberOfWebhooksPerGuildReached = 30058,
    MaximumNumberOfChannelPermissionOverwritesReached = 30060,
    TheChannelsForThisGuildAreTooLarge = 30061,
    Unauthorized = 40001,
    VerifyYourAccount = 40002,
    OpeningDirectMessagesTooFast = 40003,
    SendMessagesHasBeenTemporarilyDisabled = 40004,
    RequestEntityTooLarge = 40005,
    FeatureTemporarilyDisabledServerSide = 40006,
    UserBannedFromThisGuild = 40007,
    ConnectionHasBeenRevoked = 40012,
    TargetUserIsNotConnectedToVoice = 40032,
    ThisMessageWasAlreadyCrossposted = 40033,
    ApplicationCommandWithThatNameAlreadyExists = 40041,
    ApplicationInteractionFailedToSend = 40043,
    CannotSendAMessageInAForumChannel = 40058,
    InteractionHasAlreadyBeenAcknowledged = 40060,
    TagNamesMustBeUnique = 40061,
    ServiceResourceIsBeingRateLimited = 40062,
    ThereAreNoTagsAvailableThatCanBeSetByNonModerators = 40066,
    TagRequiredToCreateAForumPostInThisChannel = 40067,
    MissingAccess = 50001,
    InvalidAccountType = 50002,
    CannotExecuteActionOnDMChannel = 50003,
    GuildWidgetDisabled = 50004,
    CannotEditMessageAuthoredByAnotherUser = 50005,
    CannotSendAnEmptyMessage = 50006,
    CannotSendMessagesToThisUser = 50007,
    CannotSendMessagesInNonTextChannel = 50008,
    ChannelVerificationLevelTooHighForYouToGainAccess = 50009,
    OAuth2ApplicationDoesNotHaveBot = 50010,
    OAuth2ApplicationLimitReached = 50011,
    InvalidOAuth2State = 50012,
    MissingPermissions = 50013,
    InvalidToken = 50014,
    NoteWasTooLong = 50015,
    ProvidedTooFewOrTooManyMessagesToDelete = 50016,
    InvalidMFALevel = 50017,
    MessageCanOnlyBePinnedInTheChannelItWasSentIn = 50019,
    InviteCodeInvalidOrTaken = 50020,
    CannotExecuteActionOnSystemMessage = 50021,
    CannotExecuteActionOnThisChannelType = 50024,
    InvalidOAuth2AccessToken = 50025,
    MissingRequiredOAuth2Scope = 50026,
    InvalidWebhookToken = 50027,
    InvalidRole = 50028,
    InvalidRecipients = 50033,
    OneOfTheMessagesProvidedWasTooOldForBulkDelete = 50034,
    InvalidFormBodyOrContentType = 50035,
    InviteAcceptedToGuildWithoutTheBotBeingIn = 50036,
    InvalidActivityAction = 50039,
    InvalidAPIVersion = 50041,
    FileUploadedExceedsMaximumSize = 50045,
    InvalidFileUploaded = 50046,
    CannotSelfRedeemThisGift = 50054,
    InvalidGuild = 50055,
    InvalidRequestOrigin = 50067,
    InvalidMessageType = 50068,
    PaymentSourceRequiredToRedeemGift = 50070,
    CannotModifyASystemWebhook = 50073,
    CannotDeleteChannelRequiredForCommunityGuilds = 50074,
    CannotEditStickersWithinMessage = 50080,
    InvalidStickerSent = 50081,
    InvalidActionOnArchivedThread = 50083,
    InvalidThreadNotificationSettings = 50084,
    ParameterEarlierThanCreation = 50085,
    CommunityServerChannelsMustBeTextChannels = 50086,
    TheEntityTypeOfTheEventIsDifferentFromTheEntityYouAreTryingToStartTheEventFor = 50091,
    ServerNotAvailableInYourLocation = 50095,
    ServerNeedsMonetizationEnabledToPerformThisAction = 50097,
    ServerNeedsMoreBoostsToPerformThisAction = 50101,
    RequestBodyContainsInvalidJSON = 50109,
    OwnershipCannotBeMovedToABotUser = 50132,
    FailedToResizeAssetBelowTheMinimumSize = 50138,
    CannotMixSubscriptionAndNonSubscriptionRolesForAnEmoji = 50144,
    CannotConvertBetweenPremiumEmojiAndNormalEmoji = 50145,
    UploadedFileNotFound = 50146,
    VoiceMessagesDoNotSupportAdditionalContent = 50159,
    VoiceMessagesMustHaveASingleAudioAttachment = 50160,
    VoiceMessagesMustHaveSupportingMetadata = 50161,
    VoiceMessagesCannotBeEdited = 50162,
    CannotDeleteGuildSubscriptionIntegration = 50163,
    YouCannotSendVoiceMessagesInThisChannel = 50173,
    YouDoNotHavePermissionToSendThisSticker = 50600,
    TwoFactorAuthenticationIsRequired = 60003,
    NoUsersWithDiscordTagExist = 80004,
    ReactionWasBlocked = 90001,
    ApplicationNotYetAvailable = 110001,
    APIResourceOverloaded = 130000,
    TheStageIsAlreadyOpen = 150006,
    CannotReplyWithoutPermissionToReadMessageHistory = 160002,
    ThreadAlreadyCreatedForMessage = 160004,
    ThreadLocked = 160005,
    MaximumActiveThreads = 160006,
    MaximumActiveAnnouncementThreads = 160007,
    InvalidJSONForUploadedLottieFile = 170001,
    UploadedLottiesCannotContainRasterizedImages = 170002,
    StickerMaximumFramerateExceeded = 170003,
    StickerFrameCountExceedsMaximumOf1000Frames = 170004,
    LottieAnimationMaximumDimensionsExceeded = 170005,
    StickerFramerateIsTooSmallOrTooLarge = 170006,
    StickerAnimationDurationExceedsMaximumOf5Seconds = 170007,
    CannotUpdateAFinishedEvent = 180000,
    FailedToCreateStageNeededForStageEvent = 180002,
    MessageWasBlockedByAutomaticModeration = 200000,
    TitleWasBlockedByAutomaticModeration = 200001,
    WebhooksPostedToForumChannelsMustHaveAThreadNameOrThreadId = 220001,
    WebhooksPostedToForumChannelsCannotHaveBothAThreadNameAndThreadId = 220002,
    WebhooksCanOnlyCreateThreadsInForumChannels = 220003,
    WebhookServicesCannotBeUsedInForumChannels = 220004,
    MessageBlockedByHarmfulLinksFilter = 240000,
};
