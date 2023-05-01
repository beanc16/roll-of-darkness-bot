const fs = require("fs");
const path = require("path");
const appRootPath = require("app-root-path");
const { REST, Routes } = require('discord.js');
const { logger } = require("@beanc16/logger");
const { slashCommands: commonSlashCommands } = require("@beanc16/discordjs-common-commands");

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

class SlashCommandsContainer
{
    static _slashCommands = {};
    static _guildCommands = {};

    static { // Static constructor
        // Initialize common commands
        Object.values(commonSlashCommands).forEach((command) =>
        {
            SlashCommandsContainer.addCommand({
                commandName: command.commandName,
                command,
            });
        });

        // Initialize commands in the /src/commands-slash folder
        const commandsDirPath = appRootPath.resolve("./src/commands-slash");
        const guildCommandsDirPath = appRootPath.resolve("./src/commands-slash/guild-commands");

        // Get all files and directories in the commands folder.
        const files = (fs.existsSync(commandsDirPath))
            ? fs.readdirSync(commandsDirPath)
            : [];
        const guildCommandFiles = (fs.existsSync(guildCommandsDirPath))
            ? fs.readdirSync(guildCommandsDirPath)
            : [];

        // Initialize each command.
        files.forEach((fileName) =>
        {
            // Is a command file
            if (path.extname(fileName).toLowerCase() === ".js")
            {
                const extensionIndex = fileName.indexOf(".js");
                const commandNameFromFileName = fileName.substring(0, extensionIndex);
                const commandPath = path.join(commandsDirPath, commandNameFromFileName);
                const command = require(commandPath);

                SlashCommandsContainer.addCommand({
                    commandName: command.commandName,
                    command,
                });
            }
        });
    
        // Initialize each guild command.
        guildCommandFiles.forEach((fileName) =>
        {
            // Is a command file
            if (path.extname(fileName).toLowerCase() === ".js")
            {
                const extensionIndex = fileName.indexOf(".js");
                const commandNameFromFileName = fileName.substring(0, extensionIndex);
                const commandPath = path.join(guildCommandsDirPath, commandNameFromFileName);
                const command = require(commandPath);

                SlashCommandsContainer.addGuildCommand({
                    commandName: command.commandName,
                    command,
                });
            }
        });
    }



    static getCommand(commandName)
    {
        return SlashCommandsContainer._slashCommands[commandName];
    }

    static getGuildCommand(commandName)
    {
        return SlashCommandsContainer._guildCommands[commandName];
    }

    static async getAllCommandsData()
    {
        const slashCommands = Object.values(SlashCommandsContainer._slashCommands);
        const promises = slashCommands.map(async (slashCommand) => {
            await slashCommand.init();
            return slashCommand.slashCommandData;
        });
        return await Promise.all(promises);
    }

    static async getAllGuildCommandsData()
    {
        const guildCommands = Object.values(SlashCommandsContainer._guildCommands);
        const promises = guildCommands.map(async (guildCommand) => {
            await guildCommand.init();
            return guildCommand.slashCommandData;
        });
        return await Promise.all(promises);
    }

    static addCommand({
        commandName,
        command,
    })
    {
        if (!commandName)
        {
            throw new Error(`Invalid commandName in addCommand: ${commandName}`);
        }

        SlashCommandsContainer._slashCommands[commandName] = command;
    }

    static addGuildCommand({
        commandName,
        command,
    })
    {
        if (!commandName)
        {
            throw new Error(`Invalid commandName in addGuildCommand: ${commandName}`);
        }

        SlashCommandsContainer._guildCommands[commandName] = command;
    }

    static async registerAllCommands({ guildId } = {})
    {
        const [
            registeredGlobalSlashCommandData,
            registeredGuildSlashCommandData,
        ] = await Promise.all([
            this.registerGlobalCommands(),
            this.registerGuildCommands({ guildId }),
        ])

        return {
            registeredGlobalSlashCommandData,
            registeredGuildSlashCommandData,
        };
    }

    static async registerGlobalCommands()
    {
        const allCommandsData = await SlashCommandsContainer.getAllCommandsData();
        if (Object.keys(allCommandsData).length > 0)
        {
            logger.info(`Starting refresh of ${allCommandsData.length} global slash (/) commands`);
            const registeredSlashCommandData = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID), // Can pass in a guildId as a second parameter to make a slash command available in only that guild (helpful for development)
                { body: allCommandsData },
            );
            logger.info(`Successfully refreshed ${registeredSlashCommandData.length} global slash (/) commands`, registeredSlashCommandData);
            return registeredSlashCommandData;
        }
    }

    static async registerGuildCommands({ guildId } = {})
    {
        const guildCommandsData = await SlashCommandsContainer.getAllGuildCommandsData();
        if (Object.keys(guildCommandsData).length > 0)
        {
            logger.info(`Starting refresh of ${guildCommandsData.length} guild slash (/) commands`);
            const registeredSlashCommandData = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
                { body: guildCommandsData },
            );
            logger.info(`Successfully refreshed ${registeredSlashCommandData.length} guild slash (/) commands`, registeredSlashCommandData);
            return registeredSlashCommandData;
        }
    }
}



module.exports = SlashCommandsContainer;
