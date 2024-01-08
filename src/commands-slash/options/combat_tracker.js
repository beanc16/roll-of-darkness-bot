const { CombatTrackerType } = require('../../constants/combatTracker');

function name(option)
{
    option.setName('name');
    option.setDescription('The unique name of the combat.');
    option.setMinLength(1);
    option.setRequired(true);
    return option;
}

function type(option)
{
    option.setName('type');
    option.setDescription('The type of combat tracker to use (default: All).');
    option.addChoices(
        {
            name: CombatTrackerType.All,
            value: CombatTrackerType.All,
        },
        {
            name: CombatTrackerType.Hp,
            value: CombatTrackerType.Hp,
        },
        {
            name: CombatTrackerType.Initiative,
            value: CombatTrackerType.Initiative,
        },
    );
    return option;
}



module.exports = {
    name,
    type,
};
