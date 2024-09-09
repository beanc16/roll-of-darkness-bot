import fs from 'fs';
import path from 'path';
import { REST, Routes } from 'discord.js';
import { logger } from '@beanc16/logger';
import { slashCommands as commonSlashCommands } from '@beanc16/discordjs-common-commands';

import { BaseContextMenuCommand } from '../context-menus/base-commands/BaseContextMenuCommand.js';

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN as string);

type Command = typeof commonSlashCommands['Ping'];
const baseContextMenuCommand = new BaseContextMenuCommand();
type ContextMenuCommand = typeof baseContextMenuCommand;

interface AddCommandParameters {
    commandName: string;
    command: Command;
}
interface AddContextMenuCommandParameters {
    commandName: string;
    command: ContextMenuCommand;
}

interface RegisterCommandParameters {
    guildId: string;
}
const defaultRegisterCommandParameters = {
    guildId: '',
};

export class SlashCommandsContainer
{
    static #slashCommands: { [key: string]: Command } = {};
    static #guildCommands: { [key: string]: Command } = {};
    static #contextMenuCommands: { [key: string]: ContextMenuCommand } = {};

    static {
        this.initialize();
    }

    static async initialize()
    {
        this.#slashCommands = {};
        this.#guildCommands = {};
        this.#contextMenuCommands = {};
        
        // Initialize common commands
        Object.values(commonSlashCommands).forEach((command: Command) =>
        {
            SlashCommandsContainer.addCommand({
                commandName: command.commandName,
                command,
            });
        });

        // Initialize commands
        const rootDir = `${process.cwd()}/src`;
        const commandsDirPath = `${rootDir}/commands-slash`;
        const guildCommandsDirPath = `${rootDir}/commands-slash/guild-commands`;
        const contextMenuCommandsDirPath = `${rootDir}/context-menus`;

        // Get all files and directories in the commands folder.
        const files = (fs.existsSync(commandsDirPath))
            ? fs.readdirSync(commandsDirPath)
            : [];
        const guildCommandFiles = (fs.existsSync(guildCommandsDirPath))
            ? fs.readdirSync(guildCommandsDirPath)
            : [];
        const contextMenuCommandFiles = (fs.existsSync(contextMenuCommandsDirPath))
            ? fs.readdirSync(contextMenuCommandsDirPath)
            : [];

        // Initialize each command.
        const commandPromises = files.map(async (fileName: string) =>
        {
            // Is a command file
            if (path.extname(fileName).toLowerCase() === ".js" || path.extname(fileName).toLowerCase() === ".ts")
            {
                const extensionIndex = (fileName.indexOf(".js") !== -1)
                    ? fileName.indexOf(".js")
                    : fileName.indexOf(".ts");
                const commandNameFromFileName = fileName.substring(0, extensionIndex) + '.js';
                const commandPath = path.join(commandsDirPath, commandNameFromFileName);
                const command = (await import(commandPath)).default as Command;

                SlashCommandsContainer.addCommand({
                    commandName: command.commandName,
                    command,
                });
            }
        });

        // Initialize each guild command.
        const guildCommandPromises = guildCommandFiles.map(async (fileName: string) =>
        {
            // Is a command file
            if (path.extname(fileName).toLowerCase() === ".js" || path.extname(fileName).toLowerCase() === ".ts")
            {
                const extensionIndex = (fileName.indexOf(".js") !== -1)
                    ? fileName.indexOf(".js")
                    : fileName.indexOf(".ts");
                const commandNameFromFileName = fileName.substring(0, extensionIndex) + '.js';
                const commandPath = path.join(guildCommandsDirPath, commandNameFromFileName);
                const command = (await import(commandPath)).default as Command;

                SlashCommandsContainer.addGuildCommand({
                    commandName: command.commandName,
                    command,
                });
            }
        });

        // Initialize each context menu command.
        const contextMenuCommandPromises = contextMenuCommandFiles.map(async (fileName: string) =>
        {
            // Is a command file
            if (path.extname(fileName).toLowerCase() === ".js" || path.extname(fileName).toLowerCase() === ".ts")
            {
                const extensionIndex = (fileName.indexOf(".js") !== -1)
                    ? fileName.indexOf(".js")
                    : fileName.indexOf(".ts");
                const commandNameFromFileName = fileName.substring(0, extensionIndex) + '.js';
                const commandPath = path.join(contextMenuCommandsDirPath, commandNameFromFileName);
                const command = (await import(commandPath)).default as ContextMenuCommand;

                SlashCommandsContainer.addContextMenuCommand({
                    commandName: command.commandName,
                    command,
                });
            }
        });

        await Promise.all([
            ...commandPromises,
            ...guildCommandPromises,
            ...contextMenuCommandPromises,
        ]);
    }



    static getCommand(commandName: string)
    {
        return SlashCommandsContainer.#slashCommands[commandName];
    }

    static getGuildCommand(commandName: string)
    {
        return SlashCommandsContainer.#guildCommands[commandName];
    }

    static getContextMenuCommand(commandName: string)
    {
        return SlashCommandsContainer.#contextMenuCommands[commandName];
    }

    static async getAllCommandsData()
    {
        const slashCommands = Object.values(SlashCommandsContainer.#slashCommands);
        const promises = slashCommands.map(async (slashCommand) => {
            await slashCommand.init();
            return slashCommand.slashCommandData;
        });
        return await Promise.all(promises);
    }

    static async getAllGuildCommandsData()
    {
        const guildCommands = Object.values(SlashCommandsContainer.#guildCommands);
        const promises = guildCommands.map(async (guildCommand) => {
            await guildCommand.init();
            return guildCommand.slashCommandData;
        });
        return await Promise.all(promises);
    }

    static async getAllContextMenuCommandsData()
    {
        const slashCommands = Object.values(SlashCommandsContainer.#contextMenuCommands);
        const promises = slashCommands.map(async (slashCommand) => {
            await slashCommand.init();
            return slashCommand.commandData;
        });
        return await Promise.all(promises);
    }

    static addCommand({
        commandName,
        command,
    } : AddCommandParameters)
    {
        if (!commandName)
        {
            throw new Error(`Invalid commandName in addCommand: ${commandName}`);
        }

        SlashCommandsContainer.#slashCommands[commandName] = command;
    }

    static addGuildCommand({
        commandName,
        command,
    } : AddCommandParameters)
    {
        if (!commandName)
        {
            throw new Error(`Invalid commandName in addGuildCommand: ${commandName}`);
        }

        SlashCommandsContainer.#guildCommands[commandName] = command;
    }

    static addContextMenuCommand({
        commandName,
        command,
    } : AddContextMenuCommandParameters)
    {
        if (!commandName)
        {
            throw new Error(`Invalid commandName in addContextMenuCommand: ${commandName}`);
        }

        SlashCommandsContainer.#contextMenuCommands[commandName] = command;
    }

    static async registerAllCommands({ guildId } : RegisterCommandParameters = defaultRegisterCommandParameters)
    {
        await this.initialize();

        const [
            registeredGlobalSlashCommandData,
            registeredGuildSlashCommandData,
        ] = await Promise.all([
            this.registerGlobalAndContextMenuCommands(),
            this.registerGuildCommands({ guildId }),
        ]);

        return {
            registeredGlobalSlashCommandData,
            registeredGuildSlashCommandData,
        };
    }

    static async registerGlobalAndContextMenuCommands(): Promise<unknown[] | undefined>
    {
        const [
            allCommandsData,
            contextMenuCommandsData,
        ] = await Promise.all([
            SlashCommandsContainer.getAllCommandsData(),
            SlashCommandsContainer.getAllContextMenuCommandsData(),
        ]);

        const data = [
            ...allCommandsData,
            ...contextMenuCommandsData,
        ];
        if (Object.keys(data).length > 0)
        {
            logger.info(`Starting refresh of ${data.length} global slash (/) and context menu commands`);
            const registeredSlashCommandData = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID as string), // Can pass in a guildId as a second parameter to make a slash command available in only that guild (helpful for development)
                { body: data },
            ) as unknown[];
            logger.info(`Successfully refreshed ${registeredSlashCommandData.length} global slash (/) commands`, registeredSlashCommandData);
            return registeredSlashCommandData;
        }

        return undefined;
    }

    static async registerGuildCommands({ guildId } : RegisterCommandParameters = defaultRegisterCommandParameters): Promise<unknown[] | undefined>
    {
        const guildCommandsData = await SlashCommandsContainer.getAllGuildCommandsData();
        if (Object.keys(guildCommandsData).length > 0)
        {
            logger.info(`Starting refresh of ${guildCommandsData.length} guild slash (/) commands`);
            const registeredSlashCommandData = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID as string, guildId),
                { body: guildCommandsData },
            ) as unknown[];
            logger.info(`Successfully refreshed ${registeredSlashCommandData.length} guild slash (/) commands`, registeredSlashCommandData);
            return registeredSlashCommandData;
        }

        return undefined;
    }
}
