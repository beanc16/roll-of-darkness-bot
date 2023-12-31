const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const { RollOfDarknessApi } = require('@beanc16/microservices-abstraction');
const subcommandsGroups = require('./subcommand-groups');
const FlavorTextService = require('../../services/FlavorTextService');
const JsonPrettifierService = require('../../services/JsonPrettifierService');

class Admin extends BaseSlashCommand
{
    async init()
    {
        if (!this._isInitialized)
        {
            this._slashCommandData
                .addSubcommandGroup(subcommandsGroups.getAll)
                .addSubcommandGroup(subcommandsGroups.get)
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
        const flavorTextService = new FlavorTextService();

        if (subcommandGroup === 'get_all')
        {
            const jsonPrettifierService = new JsonPrettifierService();

            if (subcommand === 'category')
            {
                const categoryMap = await flavorTextService.getCategories({ refreshCache: true });
                const categories = Object.values(categoryMap);

                responseMessage = jsonPrettifierService.getArrayOfObjectsAsString(
                    categories
                );
            }

            else if (subcommand === 'flavor_text')
            {
                const flavorTexts = await flavorTextService.getAllFlavorText({ refreshCache: true });

                responseMessage = jsonPrettifierService.getArrayOfStringsAsString(
                    flavorTexts
                );
            }
        }

        else if (subcommandGroup === 'get')
        {
            const jsonPrettifierService = new JsonPrettifierService();

            if (subcommand === 'flavor_text')
            {
                const splat = interaction.options.getString('splat') || await flavorTextService.getCategory('GENERAL');
                const category1 = interaction.options.getString('category1');
                const category2 = interaction.options.getString('category2');

                const categories = [
                    ...(category1 ? [
                        await flavorTextService.getCategory(category1.toUpperCase())
                    ] : []),
                    ...(category2 ? [
                        await flavorTextService.getCategory(category2.toUpperCase())
                    ] : []),
                ];

                // TODO: Remove this later when validation is added to the API
                if (splat)
                {
                    const flavorTexts = await flavorTextService.getFlavorText({
                        refreshCache: true,
                        splat,
                        categories,
                    });

                    responseMessage = jsonPrettifierService.getArrayOfStringsAsString(
                        flavorTexts
                    );
                }
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
                    // TODO: Move this create to the FlavorTextService later
                    const {
                        data: {
                            message = '',
                        } = {},
                    } = await RollOfDarknessApi.categories.create({
                        category,
                        categoryType,
                    });

                    responseMessage = message;
                    await flavorTextService.getCategories({ refreshCache: true }); // Refresh categories
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
                        await flavorTextService.getCategory(category1.toUpperCase())
                    ] : []),
                    ...(category2 ? [
                        await flavorTextService.getCategory(category2.toUpperCase())
                    ] : []),
                ];

                // TODO: Remove this later when validation is added to the API
                if (flavorText && diceCount !== null && categories.length > 0)
                {
                    // TODO: Move this create to the FlavorTextService later
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
                    await flavorTextService.getAllFlavorText({ refreshCache: true }); // Refresh flavor text
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
