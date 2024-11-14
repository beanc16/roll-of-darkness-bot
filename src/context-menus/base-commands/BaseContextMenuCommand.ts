import {
    ApplicationCommandType,
    Client,
    ContextMenuCommandBuilder,
    Permissions,
} from 'discord.js';

export class BaseContextMenuCommand
{
    protected isInitialized: boolean;
    protected contextMenuCommandData: ContextMenuCommandBuilder;

    constructor()
    {
        this.isInitialized = false;
        this.contextMenuCommandData = new ContextMenuCommandBuilder()
            .setName(this.commandName)
            .setType(ApplicationCommandType.Message)
            .setDefaultMemberPermissions(this.requiredPermissions);
    }

    public async init(): Promise<void>
    {
        this.isInitialized = true;
    }

    public async run(_bot: Client<boolean>, _interaction: BaseContextMenuCommand): Promise<void>
    {
        throw new Error(`${this.commandName} has not yet been implemented!`);
    }

    get commandData(): ContextMenuCommandBuilder
    {
        return this.contextMenuCommandData;
    }

    get commandName(): string
    {
        return this.constructor.name.toLowerCase();
    }

    // eslint-disable-next-line class-methods-use-this -- Leave this here for subclasses
    get requiredPermissions(): Permissions | undefined
    {
        return undefined;
    }
}
