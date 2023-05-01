function getAllCategories(subcommand)
{
    subcommand.setName('category');
    subcommand.setDescription('Get all categories');
    return subcommand;
}



module.exports = getAllCategories;