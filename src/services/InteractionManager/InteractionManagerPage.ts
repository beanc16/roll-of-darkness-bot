import {
    InteractionEditReplyOptions,
    InteractionReplyOptions,
    InteractionUpdateOptions,
} from 'discord.js';

type InteractionEmbedsAndComponents = Pick<
    InteractionEditReplyOptions | InteractionUpdateOptions | InteractionReplyOptions,
    'embeds' | 'components'
> & Pick<InteractionReplyOptions, 'ephemeral'>;

export class InteractionManagerPage implements InteractionEmbedsAndComponents
{
    public components: InteractionEmbedsAndComponents['components'];
    public embeds: InteractionEmbedsAndComponents['embeds'];
    public ephemeral?: boolean;

    constructor({
        components,
        embeds,
        ephemeral,
    }: InteractionEmbedsAndComponents = {})
    {
        this.components = components;
        this.embeds = embeds;
        this.ephemeral = ephemeral;
    }
}
