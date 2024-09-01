import {
    Message,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import { BaseCustomModal } from '../BaseCustomModal.js';
import { RollOfDarknessPseudoCache } from '../../dal/RollOfDarknessPseudoCache.js';
import { getCombatTrackerActionRows } from '../../commands-slash/select-menus/combat_tracker.js';
import { updateCombatTrackerEmbedMessage } from '../../commands-slash/embed-messages/combat_tracker.js';
import { awaitCombatTrackerMessageComponents } from '../../commands-slash/message-component-handlers/combat_tracker.js';
import { CombatTrackerType, DamageType, HpType } from '../../constants/combatTracker.js';
import { Tracker } from '../../dal/RollOfDarknessMongoControllers.js';

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
        this._id = 'edit-character-modal';
        this._title = 'Edit Character';
        this._inputValuesMap = {
            [EditCharacterHpCustomIds.HpType]: [
                {
                    key: 'hpType',
                    label: '',
                    value: HpType.Damage,
                    typeOfValue: 'string',
                },
            ],
            [EditCharacterHpCustomIds.DamageType]: [
                {
                    key: 'damageType',
                    label: '',
                    value: DamageType.Lethal,
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
            .setLabel(`Change HP? (damage / heal / downgrade)`)
            .setStyle(this._styleMap[EditCharacterHpCustomIds.HpType])
            .setMinLength(1)
            .setMaxLength(9)
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
            .setCustomId(EditCharacterHpCustomIds.DamageType)
            .setLabel(`Type of damage? (bashing / lethal / agg)`)
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
        // Send message to show the command was received
        await interaction.deferUpdate({
            fetchReply: true,
        });

        const tracker = this._inputData as Tracker;

        const {
            [EditCharacterHpCustomIds.Name]: characterName,
            [EditCharacterHpCustomIds.HpType]: hpType,
            [EditCharacterHpCustomIds.Hp]: damageToDo,
            [EditCharacterHpCustomIds.DamageType]: damageType,
        } = this.parseInput<EditCharacterHpCustomIds>(interaction);

        await RollOfDarknessPseudoCache.editCharacterHp({
            tracker,
            interaction,
            characterName: characterName as string,
            hpType: hpType as HpType,
            damageType: damageType as DamageType,
            damageToDo: damageToDo as number,
        });

        // Get components.
        const actionRows = getCombatTrackerActionRows({
            typeOfTracker: tracker.type,
            combatTrackerStatus: tracker.status,
        });

        // Get characters.
        const characters = await RollOfDarknessPseudoCache.getCharacters({ tracker });

        // Handle the components of the embed message.
        awaitCombatTrackerMessageComponents({
            message: interaction.message as Message,
            tracker,
        });

        // Update message.
        await updateCombatTrackerEmbedMessage({
            tracker,
            characters,
            interaction,
            actionRows,
        });
    }
}