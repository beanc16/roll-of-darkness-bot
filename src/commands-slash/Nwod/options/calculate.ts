import {
    APIApplicationCommandOptionChoice,
    SlashCommandBooleanOption,
    SlashCommandNumberOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
} from 'discord.js';

export enum NwodCalculateSubcommand
{
    ChaseSuccesses = 'chase_successes',
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

const opponentsTurnLead = (option: SlashCommandNumberOption): SlashCommandNumberOption =>
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

const environmentDangerModifier = (option: SlashCommandNumberOption): SlashCommandNumberOption =>
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
    subcommand.setDescription('Get a list of conditions based on the given parameters.');

    subcommand.addStringOption(chaseOptions.opponentsSpeed);
    subcommand.addStringOption(chaseOptions.initiativeModifier);
    subcommand.addStringOption(chaseOptions.territory);
    subcommand.addNumberOption(chaseOptions.opponentsTurnLead);
    subcommand.addBooleanOption(chaseOptions.sizeIsLowerThanOpponents);
    subcommand.addBooleanOption(chaseOptions.opponentCannotBeTired);
    subcommand.addNumberOption(chaseOptions.environmentDangerModifier);

    return subcommand;
};
