import {
    Message,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import { BaseCustomModal } from '../BaseCustomModal';
import { RollOfDarknessPseudoCache } from '../../dal/RollOfDarknessPseudoCache';
import { getCombatTrackerActionRows } from '../../commands-slash/select-menus/combat_tracker';
import { updateCombatTrackerEmbedMessage } from '../../commands-slash/embed-messages/combat_tracker';
import { awaitCombatTrackerMessageComponents } from '../../commands-slash/message-component-handlers/combat_tracker';
import { CombatTrackerType } from '../../constants/combatTracker';
import { Tracker } from '../../dal/RollOfDarknessMongoControllers';

export enum EditCharacterHpCustomIds
{
    Name = 'name-text-input',
    HpType = 'hp-type-text-input',
    Hp = 'hp-text-input',
    DamageType = 'damage-type-text-input',
}

export class EditCharacterHpModal extends BaseCustomModal
{
    static {
        this._id = 'add-character-modal';
        this._title = 'Add Character';
        this._inputValuesMap = {
            [EditCharacterHpCustomIds.HpType]: [
                {
                    key: 'hpType',
                    label: '',
                    value: 'damaged',
                    typeOfValue: 'string',
                },
            ],
            [EditCharacterHpCustomIds.DamageType]: [
                {
                    key: 'damageType',
                    label: '',
                    value: 'lethal',
                    typeOfValue: 'string',
                },
            ],
        };
        this._styleMap = {
            [EditCharacterHpCustomIds.Name]: TextInputStyle.Short,
            [EditCharacterHpCustomIds.HpType]: TextInputStyle.Short,
            [EditCharacterHpCustomIds.Hp]: TextInputStyle.Short,
            [EditCharacterHpCustomIds.DamageType]: TextInputStyle.Short,
        };
    }

    static getTextInputs<TextInputParamaters = Tracker>(mistypedTracker: TextInputParamaters): TextInputBuilder[]
    {
        const type = (mistypedTracker as Tracker).type;

        const nameInput = new TextInputBuilder()
			.setCustomId(EditCharacterHpCustomIds.Name)
			.setLabel(`What character's HP should be updated?`)
			.setStyle(this._styleMap[EditCharacterHpCustomIds.Name])
            .setMinLength(1)
            .setMaxLength(255)
            .setRequired(true);

        const hpTypeInput = new TextInputBuilder()
            .setCustomId(EditCharacterHpCustomIds.HpType)
            .setLabel(`Should the character's HP be damaged or healed? (damaged / healed)`)
            .setStyle(this._styleMap[EditCharacterHpCustomIds.HpType])
            .setMinLength(1)
            .setMaxLength(7)
            .setRequired(true)
            .setValue(
                this.getInputValues(EditCharacterHpCustomIds.HpType)
            );

        const hpInput = new TextInputBuilder()
            .setCustomId(EditCharacterHpCustomIds.Hp)
            .setLabel(`How much HP? (number)`)
            .setStyle(this._styleMap[EditCharacterHpCustomIds.Hp])
            .setMinLength(1)
            .setMaxLength(3)
            .setRequired(true);

        const damageTypeInput = new TextInputBuilder()
            .setCustomId(EditCharacterHpCustomIds.HpType)
            .setLabel(`What type of damage is it? (bashing / lethal / agg)`)
            .setStyle(this._styleMap[EditCharacterHpCustomIds.DamageType])
            .setMinLength(1)
            .setMaxLength(7)
            .setRequired(true)
            .setValue(
                this.getInputValues(EditCharacterHpCustomIds.DamageType)
            );

        return [
            nameInput,
            ...((!type || type === CombatTrackerType.All || type === CombatTrackerType.Initiative)
                ? []
                : []
            ),
            ...((!type || type === CombatTrackerType.All || type === CombatTrackerType.Hp)
                ? [hpTypeInput, hpInput, damageTypeInput]
                : []
            ),
        ];
    }

    static async run(interaction: ModalSubmitInteraction)
    {
        const tracker = this._inputData as Tracker;

        const {
            // [EditCharacterHpCustomIds.Name]: characterName,
            // [EditCharacterHpCustomIds.HpType]: hpType,
            // [EditCharacterHpCustomIds.Hp]: hp,
            // [EditCharacterHpCustomIds.DamageType]: damageType,
        } = this.parseInput<EditCharacterHpCustomIds>(interaction);

        // const {
        //     tracker,
        // } = await RollOfDarknessPseudoCache.createCharacter({
        //     characterName: data[EditCharacterHpCustomIds.Name] as string,
        //     ...(initiative && {
        //         initiative,
        //     }),
        //     ...(data[EditCharacterHpCustomIds.Hp] && {
        //         maxHp: (data[EditCharacterHpCustomIds.Hp] as Record<string, unknown>).maxHp as number,
        //         bashingDamage: (data[EditCharacterHpCustomIds.Hp] as Record<string, unknown>).bashingDamage as number,
        //         lethalDamage: (data[EditCharacterHpCustomIds.Hp] as Record<string, unknown>).lethalDamage as number,
        //         aggravatedDamage: (data[EditCharacterHpCustomIds.Hp] as Record<string, unknown>).aggravatedDamage as number,
        //     }),
        //     nameIsSecret: (data[EditCharacterHpCustomIds.Secrets] as Record<string, unknown>).nameIsSecret as boolean,
        //     initiativeIsSecret: (data[EditCharacterHpCustomIds.Secrets] as Record<string, unknown>).initiativeIsSecret as boolean,
        //     hpIsSecret: (data[EditCharacterHpCustomIds.Secrets] as Record<string, unknown>).hpIsSecret as boolean,
        //     interaction,
        //     message: interaction.message as Message,
        // });

        // // Get components.
        // const actionRows = getCombatTrackerActionRows({
        //     typeOfTracker: tracker.type,
        //     combatTrackerStatus: tracker.status,
        // });

        // // Get characters.
        // const characters = RollOfDarknessPseudoCache.getCharacters({ tracker });

        // // Handle the components of the embed message.
        // awaitCombatTrackerMessageComponents({
        //     message: interaction.message as Message,
        //     tracker,
        // });

        // // Update message.
        // await updateCombatTrackerEmbedMessage({
        //     tracker,
        //     characters,
        //     interaction,
        //     actionRows,
        // });
    }
}