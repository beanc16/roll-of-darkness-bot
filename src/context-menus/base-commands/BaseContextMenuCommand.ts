import {
    ApplicationCommandType,
    Client,
    ContextMenuCommandBuilder,
    MessageContextMenuCommandInteraction,
    Permissions,
} from 'discord.js';

export class BaseContextMenuCommand
{
    protected isInitialized: boolean;
    public contextMenuCommandData: ContextMenuCommandBuilder;

    constructor()
    {
        this.isInitialized = false;
        this.contextMenuCommandData = new ContextMenuCommandBuilder()
            .setName(this.commandName)
            .setType(ApplicationCommandType.Message)
            .setDefaultMemberPermissions(this.requiredPermissions);
    }

    // eslint-disable-next-line @typescript-eslint/require-await -- This is meant to be inherited by subclasses, leave it as is.
    public async init(): Promise<void>
    {
        this.isInitialized = true;
    }

    public run(_bot: Client<boolean>, _interaction: MessageContextMenuCommandInteraction): Promise<void>
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
