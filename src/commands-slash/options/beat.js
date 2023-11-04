function friend(option)
{
    option.setName('friend');
    option.setDescription(`A person to say you're giving a beat to.`);
    option.setRequired(true);
    return option;
}



module.exports = {
    friend,
};
