import {
    APIApplicationCommandOptionChoice,
    SlashCommandBooleanOption,
    SlashCommandIntegerOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
} from 'discord.js';

export enum NwodCalculateSubcommand
{
    ChaseSuccesses = 'chase_successes',
    HedgeNavigation = 'hedge_navigation',
}

export enum OpponentSpeed
{
    HigherThanYours = 'Is Higher Than Yours',
    TwiceYours = 'Is Twice Yours',
    TenTimesYours = 'Is Ten Times Yours',
    NoneOfTheAbove = 'None Of The Above',
}

export enum InitiativeModifier
{
    HigherThanOpponents = `Is Higher Than Your Opponent's`,
    TwiceOpponents = `Is Twice Your Opponent's`,
    ThreeTimesOpponents = `Is Three Times Your Opponent's`,
    NoneOfTheAbove = 'None Of The Above',
}

export enum Territory
{
    DoesntKnow = `Your Character Doesn't Know`,
    Knows = 'Your Character Knows',
    KnowsIntimately = 'Your Character Knows Intimately',
}

export enum CurrentClarity
{
    FourOrHigher = 'Four Or Higher',
    Three = 'Three',
    Two = 'Two',
    One = 'One',
}

export enum TimeLimit
{
    NotUrgent = 'Not Urgent',
    SomewhatUrgent = 'Somewhat Urgent',
    MoreUrgent = 'More Urgent',
    MostUrgent = 'Most Urgent',
}

const opponentsSpeed = (option: SlashCommandStringOption): SlashCommandStringOption =>
{
    option.setName('opponents_speed');
    option.setDescription(`Your opponent's speed relative to yours.`);
    option.setRequired(true);

    const choices = Object.values(OpponentSpeed).map<APIApplicationCommandOptionChoice<string>>(
        (name) =>
        {
            return {
                name,
                value: name,
            };
        },
    );
    option.addChoices(...choices);

    return option;
};

const initiativeModifier = (option: SlashCommandStringOption): SlashCommandStringOption =>
{
    option.setName('initiative_modifier');
    option.setDescription(`Your opponent's initiative relative to yours.`);
    option.setRequired(true);

    const choices = Object.values(InitiativeModifier).map<APIApplicationCommandOptionChoice<string>>(
        (name) =>
        {
            return {
                name,
                value: name,
            };
        },
    );
    option.addChoices(...choices);

    return option;
};

const territory = (option: SlashCommandStringOption): SlashCommandStringOption =>
{
    option.setName('territory');
    option.setDescription('How well your character knows the territory.');
    option.setRequired(true);

    const choices = Object.values(Territory).map<APIApplicationCommandOptionChoice<string>>(
        (name) =>
        {
            return {
                name,
                value: name,
            };
        },
    );
    option.addChoices(...choices);

    return option;
};

const opponentsTurnLead = (option: SlashCommandIntegerOption): SlashCommandIntegerOption =>
{
    option.setName('opponents_turn_lead');
    option.setDescription('How many turns the opponent leads (default: 0).');
    option.setMinValue(0);
    option.setMaxValue(2);
    return option;
};

const sizeIsLowerThanOpponents = (option: SlashCommandBooleanOption): SlashCommandBooleanOption =>
{
    option.setName('size_is_lower_than_opponents');
    option.setDescription(`Is your size lower than your opponent's? (default: False).`);
    return option;
};

const opponentCannotBeTired = (option: SlashCommandBooleanOption): SlashCommandBooleanOption =>
{
    option.setName('opponent_cannot_be_tired');
    option.setDescription('Is your opponent immune to tiredness? (default: False).');
    return option;
};

const environmentDangerModifier = (option: SlashCommandIntegerOption): SlashCommandIntegerOption =>
{
    option.setName('environment_danger_modifier');
    option.setDescription('Environmental danger level (default: 0).');
    option.setMinValue(0);
    option.setMaxValue(3);
    return option;
};

// Set options so they are clearly denoted as reusable within this file
const chaseOptions = {
    opponentsSpeed,
    initiativeModifier,
    territory,
    opponentsTurnLead,
    sizeIsLowerThanOpponents,
    opponentCannotBeTired,
    environmentDangerModifier,
};

export const chaseSuccesses = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodCalculateSubcommand.ChaseSuccesses);
    subcommand.setDescription('Get the number of successes to win a chase based on the given parameters.');

    subcommand.addStringOption(chaseOptions.opponentsSpeed);
    subcommand.addStringOption(chaseOptions.initiativeModifier);
    subcommand.addStringOption(chaseOptions.territory);
    subcommand.addIntegerOption(chaseOptions.opponentsTurnLead);
    subcommand.addBooleanOption(chaseOptions.sizeIsLowerThanOpponents);
    subcommand.addBooleanOption(chaseOptions.opponentCannotBeTired);
    subcommand.addIntegerOption(chaseOptions.environmentDangerModifier);

    return subcommand;
};

export const hedgeNavigation = (subcommand: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder =>
{
    subcommand.setName(NwodCalculateSubcommand.HedgeNavigation);
    subcommand.setDescription('Get the number of successes to navigate the hedge based on the given parameters.');

    // Required
    subcommand.addStringOption(chaseOptions.opponentsSpeed);
    subcommand.addStringOption(chaseOptions.initiativeModifier);
    subcommand.addStringOption(chaseOptions.territory);
    subcommand.addIntegerOption((option) =>
    {
        option.setName('wyrd_rating');
        option.setDescription('Your wyrd rating.');
        option.setMinValue(1);
        option.setMaxValue(10);
        option.setRequired(true);
        return option;
    });
    subcommand.addStringOption((option) =>
    {
        option.setName('current_clarity');
        option.setDescription('Your current clarity rating.');

        const choices = Object.values(CurrentClarity).map<APIApplicationCommandOptionChoice<string>>(
            (name) =>
            {
                return {
                    name,
                    value: name,
                };
            },
        );
        option.addChoices(...choices);
        option.setRequired(true);
        return option;
    });
    subcommand.addStringOption((option) =>
    {
        option.setName('time_limit');
        option.setDescription('The time limit that your character is under.');

        const choices = Object.values(TimeLimit).map<APIApplicationCommandOptionChoice<string>>(
            (name) =>
            {
                return {
                    name,
                    value: name,
                };
            },
        );
        option.addChoices(...choices);
        option.setRequired(true);
        return option;
    });

    // Optional
    subcommand.addIntegerOption(chaseOptions.opponentsTurnLead);
    subcommand.addBooleanOption(chaseOptions.sizeIsLowerThanOpponents);
    subcommand.addBooleanOption(chaseOptions.opponentCannotBeTired);
    subcommand.addIntegerOption(chaseOptions.environmentDangerModifier);
    subcommand.addIntegerOption((option) =>
    {
        option.setName('goblin_debt_accepted');
        option.setDescription('The amount of goblin debt your character accepts for hobgoblin aid.');
        option.setMinValue(0);
        option.setMaxValue(3);
        return option;
    });
    subcommand.addIntegerOption((option) =>
    {
        option.setName('huntsman_modifer');
        option.setDescription('Modifier if your character is a huntsman.');
        option.setMinValue(-2);
        option.setMaxValue(0);
        return option;
    });
    subcommand.addIntegerOption((option) =>
    {
        option.setName('trod_modifer');
        option.setDescription('Modifier per trod milestone desired.');
        option.setMinValue(0);
        option.setMaxValue(5);
        return option;
    });

    return subcommand;
};
