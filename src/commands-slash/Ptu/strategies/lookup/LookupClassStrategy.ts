import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { PtuSubcommandGroup } from '../../options/index.js';
import { PtuLookupSubcommand } from '../../options/lookup.js';
import { PtuAutocompleteParameterName } from '../../types/autocomplete.js';
import { PtuFeature } from '../../types/PtuFeature.js';
import { LookupFeatureStrategy } from './LookupFeatureStrategy.js';

export interface GetLookupClassDataParameters extends BaseLookupDataOptions
{
    name: PtuClassName;
}

enum PtuClassName
{
    Commander = 'Commander',
}

@staticImplements<ChatIteractionStrategy>()
export class LookupClassStrategy
{
    // TODO: Change this key to Class later
    public static key: PtuLookupSubcommand.Feature = PtuLookupSubcommand.Feature;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(PtuAutocompleteParameterName.FeatureName, true) as PtuClassName;

        const data = await this.getLookupData({
            name,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = LookupFeatureStrategy.getEmbedMessages(data, 'Class');

        return await LookupStrategy.run(interaction, embeds, {
            // TODO: Change PtuLookupSubcommand.Feature to PtuLookupSubcommand.Class later
            commandName: `/ptu ${PtuSubcommandGroup.Lookup} ${PtuLookupSubcommand.Feature}`,
            noEmbedsErrorMessage: 'No classes were found.',
        });
    }

    private static async getLookupData(input: GetLookupClassDataParameters): Promise<PtuFeature[]>
    {
        const classToFeaturesMap: Record<PtuClassName, string[]> = {
            [PtuClassName.Commander]: [
                PtuClassName.Commander,
                'Mobilize',
                'Leadership',
                'Battle Conductor',
                'Complex Orders',
                'Tip the Scales',
                'Scheme Twist',
            ],
        };
        const features = classToFeaturesMap[input.name];

        // TODO: Make LookupFeatureStrategy.getLookupData work with multiple feature names later.
        return await LookupFeatureStrategy.getLookupData(input);
    }
}
