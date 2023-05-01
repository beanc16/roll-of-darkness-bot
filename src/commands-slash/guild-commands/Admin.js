const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const { RollOfDarknessApi } = require('@beanc16/microservices-abstraction');
const subcommandsGroups = require('./subcommand-groups');
const categoriesSingleton = require('../../models/categoriesSingleton');

// TODO: Delete this from global command scope, move it to guild command scope
class Admin extends BaseSlashCommand
{
    async init()
    {
        if (!this._isInitialized)
        {
            this._slashCommandData
                .addSubcommandGroup(subcommandsGroups.create);
            await super.init();
        }
    }

    async run(interaction)
    {
        // Send message to show the command was received
        await interaction.deferReply({ fetchReply: true });

        // Get parameter results
        const createSubcommandGroup = interaction.options.getSubcommandGroup('create');
        const subcommand = interaction.options.getSubcommand('category')
            || interaction.options.getSubcommand('flavor_text');
        console.log('\n subcommand:', subcommand);

        let responseMessage;

        if (createSubcommandGroup === 'create')
        {
            if (subcommand === 'category')
            {
                const category = interaction.options.getString('category');
                const categoryType = interaction.options.getString('category_type');

                if (category && categoryType)
                {
                    const {
                        data: {
                            message = '',
                        } = {},
                    } = await RollOfDarknessApi.categories.create({
                        category,
                        categoryType,
                    });

                    responseMessage = message;
                }
            }

            else if (subcommand === 'flavor_text')
            {
                const flavorText = interaction.options.getString('flavor_text');
                const diceCount = interaction.options.getInteger('dice_count') || 0;
                const category1 = interaction.options.getString('category1');
                const category2 = interaction.options.getString('category2');

                const categories = [
                    ...(category1 ? [
                        categoriesSingleton.get(category1.toUpperCase())
                    ] : []),
                    ...(category2 ? [
                        categoriesSingleton.get(category2.toUpperCase())
                    ] : []),
                ];

                console.log('\n flavorText:', flavorText);
                console.log('\n diceCount:', diceCount);
                console.log('\n categories:', categories);

                // TODO: Remove this later when Joel has validation
                if (flavorText && diceCount !== null && categories.length > 0)
                {
                    const {
                        data: {
                            message = '',
                        } = {},
                    } = await RollOfDarknessApi.flavorText.create({
                        flavorText,
                        diceCount,
                        categories,
                    });

                    responseMessage = message;
                }
            }
        }

        await interaction.editReply(
            responseMessage
            || 'Subcommand Group or subcommand not yet implemented'
        );
    }

    get description()
    {
        return `Run CRUD operations on .`;
    }
}



module.exports = new Admin();
