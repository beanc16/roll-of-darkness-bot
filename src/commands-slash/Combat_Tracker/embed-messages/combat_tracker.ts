import {
    ActionRowBuilder,
    APIEmbedField,
    CommandInteraction,
    EmbedBuilder,
    ModalSubmitInteraction,
    RestOrArray,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
} from 'discord.js';

import { Tracker } from '../dal/RollOfDarknessMongoControllers.js';
import { CombatTrackerStatus, CombatTrackerType } from '../types.js';

const combatTrackerColor = 0xCDCDCD;

interface Character
{
    name: string;
    initiative?: number;
    maxHp?: number;
    currentDamage?: {
        bashing?: number;
        lethal?: number;
        aggravated?: number;
    };
    isSecret?: {
        name: boolean;
        initiative: boolean;
        hp: boolean;
    };
}

interface CombatTrackerEmbedParameters
{
    tracker: Tracker;
    characters: Character[];
}

enum HpType
{
    Empty = 0,
    Bashing = 1,
    Lethal = 2,
    Aggravated = 3,
}

const hpTypeToBoxMap = {
    [HpType.Empty]: '[   ]',
    [HpType.Bashing]: '[ / ]',
    [HpType.Lethal]: '[ X ]',
    [HpType.Aggravated]: '[ ✱ ]',
};

function getHpBoxes({ hpType, hpValue }: {
    hpType: HpType;
    hpValue: number;
}): string[]
{
    const boxes: string[] = [];

    for (let i = 0; i < hpValue; i++)
    {
        boxes.push(hpTypeToBoxMap[hpType]);
    }

    return boxes;
}

function getCharacterHpString({
    maxHp = 0,
    currentDamage: {
        bashing = 0,
        lethal = 0,
        aggravated = 0,
    } = {},
}: {
    maxHp: Character['maxHp'];
    currentDamage: Character['currentDamage'];
}): string
{
    const shouldIncludeHp = (
        maxHp !== undefined
        && bashing !== undefined
        && lethal !== undefined
        && aggravated !== undefined
    );

    if (shouldIncludeHp)
    {
        const aggravatedHpBoxes = getHpBoxes({
            hpType: HpType.Aggravated,
            hpValue: aggravated,
        });
        const lethalHpBoxes = getHpBoxes({
            hpType: HpType.Lethal,
            hpValue: lethal,
        });
        const bashingHpBoxes = getHpBoxes({
            hpType: HpType.Bashing,
            hpValue: bashing,
        });

        const numOfEmptyHpBoxes = maxHp - aggravated - lethal - bashing;
        const emptyHpBoxes = getHpBoxes({
            hpType: HpType.Empty,
            hpValue: numOfEmptyHpBoxes,
        });

        const hpBoxes = [
            ...aggravatedHpBoxes,
            ...lethalHpBoxes,
            ...bashingHpBoxes,
            ...emptyHpBoxes,
        ];

        return `HP: ${hpBoxes.join(' ')}`;
    }

    return '';
}

function getCharacterNameString({
    name: characterName,
    isTurn,
    initiative,
    tracker,
}: {
    name: Character['name'];
    isTurn: boolean;
    initiative: Character['initiative'];
    tracker: Tracker;
}): string
{
    const currentTurnMarkerOrEmptyString = (isTurn)
        ? '-->'
        : '';

    const initiativeOrEmptyString = (
        initiative !== undefined
        && (
            tracker.type === CombatTrackerType.All
            || tracker.type === CombatTrackerType.Initiative
        )
    )
        ? ` | Init: ${initiative}`
        : '';

    return `${currentTurnMarkerOrEmptyString} ${characterName}${initiativeOrEmptyString}`;
}

function sortCharacterFields(characters: Character[] = []): Character[]
{
    /*
     * Sort in descending order such that bigger initiative values
     * are highest and undefined initiatives are lowest.
     */

    const chractersClone = Array.from(characters);

    chractersClone.sort((a, b) =>
    {
        if (!b.initiative && !a.initiative)
        {
            return 0;
        }

        if (!b.initiative)
        {
            return -1;
        }

        if (!a.initiative)
        {
            return 1;
        }

        return b.initiative - a.initiative;
    });

    return chractersClone;
}

function getCharacterFields({ tracker, characters }: CombatTrackerEmbedParameters): RestOrArray<APIEmbedField>
{
    const sortedCharacters = sortCharacterFields(characters);

    const fields = sortedCharacters.map(({
        name,
        initiative,
        maxHp,
        currentDamage,
    }, index) =>
    {
        const characterString = getCharacterNameString({
            name,
            initiative,
            isTurn: (
                (
                    tracker.type === CombatTrackerType.All
                    || tracker.type === CombatTrackerType.Initiative
                )
                && tracker.status === CombatTrackerStatus.InProgress
                && index === tracker.currentTurn
            ),
            tracker,
        });

        const hpString = (tracker.type === CombatTrackerType.All || tracker.type === CombatTrackerType.Hp)
            ? getCharacterHpString({
                maxHp,
                currentDamage,
            })
            : ' ';

        return {
            name: characterString,
            value: hpString,
        } as APIEmbedField;
    });

    return fields;
}

function getDescription(tracker: Tracker)
{
    if (tracker.status === CombatTrackerStatus.InProgress)
    {
        if (tracker.type === CombatTrackerType.Hp)
        {
            return 'In Progress';
        }

        return `Round ${tracker.round}`;
    }

    if (tracker.status === CombatTrackerStatus.NotStarted)
    {
        return 'Not Started';
    }

    if (tracker.status === CombatTrackerStatus.Completed)
    {
        return 'Complete';
    }

    return ' ';
}

function getCombatTrackerEmbedMessage({ tracker, characters }: CombatTrackerEmbedParameters)
{
    const fields = getCharacterFields({
        tracker,
        characters,
    });

    const description = getDescription(tracker);

    const embed = new EmbedBuilder()
        .setTitle(tracker.name || 'Current Combat:')
        .setDescription(description)
        .setColor(combatTrackerColor)
        .setFields(...fields);

    return embed;
}

export async function updateCombatTrackerEmbedMessage(parameters: CombatTrackerEmbedParameters & {
    interaction: CommandInteraction | StringSelectMenuInteraction | ModalSubmitInteraction;
    actionRows: ActionRowBuilder<StringSelectMenuBuilder>[];
})
{
    // Get embed message
    const embedMessage = getCombatTrackerEmbedMessage(parameters);

    // Get parameters for message
    const { interaction, actionRows } = parameters;

    // Send message
    if (interaction instanceof CommandInteraction)
    {
        await interaction.editReply({
            embeds: [embedMessage],
            components: actionRows,
        });
    }
    else if (interaction instanceof StringSelectMenuInteraction)
    {
        await interaction.update({
            embeds: [embedMessage],
            components: actionRows,
        });
    }
    else if (interaction instanceof ModalSubmitInteraction)
    {
        await interaction.message?.edit({
            embeds: [embedMessage],
            components: actionRows,
        });
    }
}
