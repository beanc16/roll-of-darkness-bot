import { Text } from '@beanc16/discordjs-helpers';
import { ChatInputCommandInteraction } from 'discord.js';

import { staticImplements } from '../../../../decorators/staticImplements.js';
import { CachedGoogleSheetsApiService } from '../../../../services/CachedGoogleSheetsApiService/CachedGoogleSheetsApiService.js';
import { getPagedEmbedMessages } from '../../../embed-messages/shared.js';
import { LookupStrategy } from '../../../strategies/BaseLookupStrategy.js';
import { ChatIteractionStrategy } from '../../../strategies/types/ChatIteractionStrategy.js';
import { BaseLookupDataOptions } from '../../../strategies/types/types.js';
import { rollOfDarknessNwodSpreadsheetId } from '../../constants.js';
import { NwodSubcommandGroup } from '../../options/index.js';
import { NwodLookupSubcommand } from '../../options/lookup.js';
import { NwodAutocompleteParameterName, NwodLookupRange } from '../../types/lookup.js';
import { NwodWeapon } from '../../types/NwodWeapon.js';
import { NwodWeaponType } from '../../types/types.js';

export interface GetLookupWeaponDataOptions extends BaseLookupDataOptions
{
    name?: string | null;
    type?: NwodWeaponType | null;
}

@staticImplements<ChatIteractionStrategy>()
export class LookupWeaponStrategy
{
    public static key = NwodLookupSubcommand.Weapon;

    public static async run(interaction: ChatInputCommandInteraction): Promise<boolean>
    {
        // Get parameter results
        const name = interaction.options.getString(NwodAutocompleteParameterName.WeaponName);
        const type = interaction.options.getString('type') as NwodWeaponType | null;

        const data = await this.getLookupData({
            name,
            type,
            includeAllIfNoName: false,
        });

        // Get message
        const embeds = getPagedEmbedMessages({
            input: data,
            title: 'Weapons',
            parseElementToLines: element => [
                `${Text.bold(element.name)}`,
                ...(element.weaponType !== undefined
                    ? [`Weapon Type: ${element.weaponType}`]
                    : []
                ),
                ...(element.damage !== undefined
                    ? [`Damage: ${element.damage}`]
                    : []
                ),
                ...(element.range !== undefined
                    ? [`Range: ${element.range}`]
                    : []
                ),
                ...(element.capacity !== undefined
                    ? [`Capacity: ${element.capacity}`]
                    : []
                ),
                ...(element.initiativeModifier !== undefined
                    ? [`Initiative Modifier: ${element.initiativeModifier}`]
                    : []
                ),
                ...(element.strengthRequirement !== undefined
                    ? [`Strength Requirement: ${element.strengthRequirement}`]
                    : []
                ),
                ...(element.size !== undefined
                    ? [`Size: ${element.size}`]
                    : []
                ),
                ...(element.availability !== undefined
                    ? [`Availability: ${element.availability}`]
                    : []
                ),
                ...(element.page !== undefined
                    ? [`Page: ${element.page}`]
                    : []
                ),
                ...(element.hasBonusEffect !== undefined
                    ? [`Has Bonus Effect: ${element.hasBonusEffect ? 'Yes' : 'No'}`]
                    : []
                ),
                ...(element.effect !== undefined && element.effect !== '--'
                    ? [
                        `Effect:\n\`\`\`\n${element.effect}\`\`\``,
                    ]
                    : ['']
                ),
            ],
        });

        return await LookupStrategy.run(interaction, embeds, {
            commandName: `/nwod ${NwodSubcommandGroup.Lookup} ${NwodLookupSubcommand.Weapon}`,
            noEmbedsErrorMessage: 'No weapons were found.',
        });
    }

    private static async getLookupData(input: GetLookupWeaponDataOptions = {
        includeAllIfNoName: true,
    }): Promise<NwodWeapon[]>
    {
        const { data = [] } = await CachedGoogleSheetsApiService.getRange({
            spreadsheetId: rollOfDarknessNwodSpreadsheetId,
            range: NwodLookupRange.Weapon,
        });

        const output = data.reduce<NwodWeapon[]>((acc, cur) =>
        {
            // Ignore empty rows
            if (cur[0] === undefined || cur[0].trim() === '')
            {
                return acc;
            }

            const element = new NwodWeapon(cur);

            if (element.name === undefined || element.name.trim() === '')
            {
                return acc;
            }

            // Name
            if (input.name && input.name.toLowerCase() !== element.name.toLowerCase() && !input.includeAllIfNoName)
            {
                return acc;
            }

            // Type
            if (input.type && input.type.toLowerCase() !== element.weaponType.toLowerCase())
            {
                return acc;
            }

            acc.push(element);
            return acc;
        }, []);

        // Sort by name
        output.sort((a, b) =>
            a.name.localeCompare(b.name),
        );

        return output;
    }
}
