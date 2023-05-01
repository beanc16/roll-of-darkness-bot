const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');
const { RollOfDarknessApi } = require('@beanc16/microservices-abstraction');
const subcommandsGroups = require('./subcommand-groups');

class Admin extends BaseSlashCommand
{
    constructor()
    {
        super();
        this._slashCommandData
            .addSubcommandGroup(subcommandsGroups.create);
    }

    async run(interaction)
    {
        // Send message to show the command was received
        await interaction.deferReply({
            ephemeral: false,
            fetchReply: true,
        });

        // Get parameter results
        //const splat = interaction.options.getString('splat');
        const createSubcommandGroup = interaction.options.getSubcommandGroup('create');
        const categorySubgroup = interaction.options.getSubcommand('category');
        console.log('\n createSubcommandGroup:', createSubcommandGroup);
        console.log('\n categorySubgroup:', categorySubgroup);

        let responseMessage;

        if (createSubcommandGroup === 'create')
        {
            if (categorySubgroup === 'category')
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

                await interaction.editReply(
                    'Ran admin command'
                );
            }
        }

        await interaction.editReply(
            responseMessage
            || 'Subcommand Group or subcommand not yet implemented'
        );
    }

    get description()
    {
        return `Roll one d10 with no rerolls or modifiers.`;
    }
}



module.exports = new Admin();
