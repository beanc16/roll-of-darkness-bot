import { slashCommands as commonSlashCommands } from '@beanc16/discordjs-common-commands';
import { logger } from '@beanc16/logger';
import {
    Client,
    ContextMenuCommandBuilder,
    REST,
    Routes,
    SlashCommandBuilder,
} from 'discord.js';
import fs from 'fs';
import path from 'path';

import { BaseContextMenuCommand } from '../../context-menus/base-commands/BaseContextMenuCommand.js';
import { Timer } from '../../services/Timer/Timer.js';

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN as string);

type Command = typeof commonSlashCommands['Ping'];
const baseContextMenuCommand = new BaseContextMenuCommand();
type ContextMenuCommand = typeof baseContextMenuCommand;

interface AddCommandParameters
{
    commandName: string;
    command: Command;
}
interface AddContextMenuCommandParameters
{
    commandName: string;
    command: ContextMenuCommand;
}

interface RegisterCommandParameters
{
    guildId: string;
}
const defaultRegisterCommandParameters = {
    guildId: '',
};

interface RegisterAllCommandsResponse
{
    registeredGlobalSlashCommandData: unknown[] | undefined;
    registeredGuildSlashCommandData: unknown[] | undefined;
}

export class SlashCommandsContainer
{
    static #slashCommands: Record<string, Command> = {};
    static #guildCommands: Record<string, Command> = {};
    static #contextMenuCommands: Record<string, ContextMenuCommand> = {};
    private static isInitialized = false;

    // eslint-disable-next-line @stylistic/brace-style -- We need a static constructor to be formatted this way to initialize
    static {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises -- This is necessary for initiailization and we can't await in a constructor
        this.initialize();
    }

    public static async initialize(): Promise<void>
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
        const rootDir = `${process.cwd()}/${(process.env.STAGE === 'dev' ? 'src' : 'dist')}`;
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
            if (path.extname(fileName).toLowerCase() === '.js' || path.extname(fileName).toLowerCase() === '.ts')
            {
                const extensionIndex = (fileName.indexOf('.js') !== -1)
                    ? fileName.indexOf('.js')
                    : fileName.indexOf('.ts');
                const commandNameFromFileName = fileName.substring(0, extensionIndex) + '.js';
                const commandPath = path.join(commandsDirPath, commandNameFromFileName);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- This is necessary for dynamic imports
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
            if (path.extname(fileName).toLowerCase() === '.js' || path.extname(fileName).toLowerCase() === '.ts')
            {
                const extensionIndex = (fileName.indexOf('.js') !== -1)
                    ? fileName.indexOf('.js')
                    : fileName.indexOf('.ts');
                const commandNameFromFileName = fileName.substring(0, extensionIndex) + '.js';
                const commandPath = path.join(guildCommandsDirPath, commandNameFromFileName);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- This is necessary for dynamic imports
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
            if (path.extname(fileName).toLowerCase() === '.js' || path.extname(fileName).toLowerCase() === '.ts')
            {
                const extensionIndex = (fileName.indexOf('.js') !== -1)
                    ? fileName.indexOf('.js')
                    : fileName.indexOf('.ts');
                const commandNameFromFileName = fileName.substring(0, extensionIndex) + '.js';
                const commandPath = path.join(contextMenuCommandsDirPath, commandNameFromFileName);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- This is necessary for dynamic imports
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

        this.isInitialized = true;
    }

    public static getCommand(commandName: string): Command
    {
        return SlashCommandsContainer.#slashCommands[commandName];
    }

    public static getGuildCommand(commandName: string): Command
    {
        return SlashCommandsContainer.#guildCommands[commandName];
    }

    public static getContextMenuCommand(commandName: string): BaseContextMenuCommand
    {
        return SlashCommandsContainer.#contextMenuCommands[commandName];
    }

    public static async getAllCommandsData(): Promise<SlashCommandBuilder[]>
    {
        const slashCommands = Object.values(SlashCommandsContainer.#slashCommands);
        const promises = slashCommands.map(async (slashCommand) =>
        {
            await slashCommand.init();
            return slashCommand.slashCommandData;
        });
        return await Promise.all(promises);
    }

    public static async getAllGuildCommandsData(): Promise<SlashCommandBuilder[]>
    {
        const guildCommands = Object.values(SlashCommandsContainer.#guildCommands);
        const promises = guildCommands.map(async (guildCommand) =>
        {
            await guildCommand.init();
            return guildCommand.slashCommandData;
        });
        return await Promise.all(promises);
    }

    public static async getAllContextMenuCommandsData(): Promise<ContextMenuCommandBuilder[]>
    {
        const slashCommands = Object.values(SlashCommandsContainer.#contextMenuCommands);
        const promises = slashCommands.map(async (slashCommand) =>
        {
            await slashCommand.init();
            return slashCommand.contextMenuCommandData;
        });
        return await Promise.all(promises);
    }

    public static async getAllStartupCommandsData(): Promise<(Command & {
        runOnStartup: (bot: Client) => Promise<void>;
    })[]>
    {
        await Timer.waitUntilTrue({
            seconds: 0.2,
            callback: () => this.isInitialized,
        });

        // eslint-disable-next-line -- @typescript-eslint/ban-ts-comment -- Fix this later
        // @ts-ignore -- TODO: Fix this later
        return Object.values(SlashCommandsContainer.#slashCommands).filter(command =>
            ('runOnStartup' in command && typeof command.runOnStartup === 'function'),
        );
    }

    public static addCommand({ commandName, command }: AddCommandParameters): void
    {
        if (!commandName)
        {
            throw new Error(`Invalid commandName in addCommand: ${commandName}`);
        }

        SlashCommandsContainer.#slashCommands[commandName] = command;
    }

    public static addGuildCommand({ commandName, command }: AddCommandParameters): void
    {
        if (!commandName)
        {
            throw new Error(`Invalid commandName in addGuildCommand: ${commandName}`);
        }

        SlashCommandsContainer.#guildCommands[commandName] = command;
    }

    public static addContextMenuCommand({ commandName, command }: AddContextMenuCommandParameters): void
    {
        if (!commandName)
        {
            throw new Error(`Invalid commandName in addContextMenuCommand: ${commandName}`);
        }

        SlashCommandsContainer.#contextMenuCommands[commandName] = command;
    }

    public static async registerAllCommands({ guildId }: RegisterCommandParameters = defaultRegisterCommandParameters): Promise<RegisterAllCommandsResponse>
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

    public static async registerGlobalAndContextMenuCommands(): Promise<unknown[] | undefined>
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

    public static async registerGuildCommands({ guildId }: RegisterCommandParameters = defaultRegisterCommandParameters): Promise<unknown[] | undefined>
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
