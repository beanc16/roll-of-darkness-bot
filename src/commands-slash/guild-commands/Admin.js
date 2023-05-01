const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const { RollOfDarknessApi } = require('@beanc16/microservices-abstraction');
const subcommandsGroups = require('./subcommand-groups');
const categoriesSingleton = require('../../models/categoriesSingleton');
const JsonPrettifierService = require('../../services/JsonPrettifierService');

class Admin extends BaseSlashCommand
{
    async init()
    {
        if (!this._isInitialized)
        {
            this._slashCommandData
                .addSubcommandGroup(subcommandsGroups.getAll)
                .addSubcommandGroup(subcommandsGroups.create);
            await super.init();
        }
    }

    async run(interaction)
    {
        // Send message to show the command was received
        await interaction.deferReply({ fetchReply: true });

        // TODO: If it isn't one of the developers of this bot running the command, say that only the developers can use this command.

        // Get parameter results
        const subcommandGroup = interaction.options.getSubcommandGroup('get_all')
            || interaction.options.getSubcommandGroup('create');
        const subcommand = interaction.options.getSubcommand('category')
            || interaction.options.getSubcommand('flavor_text');

        let responseMessage;

        if (subcommandGroup === 'get_all')
        {
            const jsonPrettifierService = new JsonPrettifierService();

            if (subcommand === 'category')
            {
                const {
                    data: {
                        categories = [],
                    } = {},
                } = await RollOfDarknessApi.categories.get();

                responseMessage = jsonPrettifierService.getArrayOfObjectsAsString(
                    categories
                );
            }

            // TODO: Get all flavor texts
            else if (subcommand === 'flavor_text')
            {
                const {
                    data: {
                        flavor_texts: flavorTexts = [],
                    } = {},
                } = await RollOfDarknessApi.flavorText.get({
                    splat: '',
                    categories: [],
                });

                responseMessage = jsonPrettifierService.getArrayOfStringsAsString(
                    flavorTexts
                );
            }
        }

        else if (subcommandGroup === 'create')
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

                // TODO: Remove this later when validation is added to the API
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
