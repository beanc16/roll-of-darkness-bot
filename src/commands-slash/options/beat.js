function friend(option)
{
    option.setName('friend');
    option.setDescription(`A person to say you're giving a beat to.`);
    option.setRequired(true);
    return option;
}

function reason(option)
{
    option.setName('reason');
    option.setDescription(`Why you're giving a beat to this person.`);
    return option;
}



module.exports = {
    friend,
    reason,
};
