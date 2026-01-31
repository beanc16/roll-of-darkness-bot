import { InteractionEditReplyOptions, InteractionUpdateOptions } from 'discord.js';

type InteractionEmbedsAndComponents = Pick<
    InteractionEditReplyOptions | InteractionUpdateOptions,
    'embeds' | 'components'
>;

export class InteractionManagerPage implements InteractionEmbedsAndComponents
{
    public components: InteractionEmbedsAndComponents['components'];
    public embeds: InteractionEmbedsAndComponents['embeds'];

    constructor({ components, embeds }: InteractionEmbedsAndComponents = {})
    {
        this.components = components;
        this.embeds = embeds;
    }
}
