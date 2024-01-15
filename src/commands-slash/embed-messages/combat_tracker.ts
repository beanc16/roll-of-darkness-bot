import { APIEmbedField, ActionRowBuilder, CommandInteraction, EmbedBuilder, ModalSubmitInteraction, RestOrArray, StringSelectMenuBuilder, StringSelectMenuInteraction } from 'discord.js';
import { CombatTrackerStatus } from '../../constants/combatTracker';

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
    isTurn?: boolean;
}

interface CombatTrackerEmbedParameters
{
    combatName: string;
    combatStatus: CombatTrackerStatus;
    roundNumber: number;
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

function getHpBoxes({
    hpType,
    hpValue,
} : {
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
} : {
    name: Character['name'];
    isTurn: Character['isTurn'];
    initiative: Character['initiative'];
}): string
{
    const currentTurnMarkerOrEmptyString = (isTurn)
            ? '-->'
            : '';

    const initiativeOrEmptyString = (initiative !== undefined)
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

function getCharacterFields(characters: Character[] = []): RestOrArray<APIEmbedField>
{
    const sortedCharacters = sortCharacterFields(characters);

    const fields = sortedCharacters.map(({
        name,
        initiative,
        isTurn,
        maxHp,
        currentDamage,
    }) => {
        const characterString = getCharacterNameString({
            name,
            initiative,
            isTurn,
        })

        const hpString = getCharacterHpString({
            maxHp,
            currentDamage,
        });

        return {
            name: characterString,
            value: hpString,
        } as APIEmbedField;
    });

    return fields;
}

function getDescription({
    roundNumber,
    combatStatus,
} : {
    roundNumber: CombatTrackerEmbedParameters['roundNumber'];
    combatStatus: CombatTrackerEmbedParameters['combatStatus'];
})
{
    if (combatStatus === CombatTrackerStatus.InProgress)
    {
        return `Round ${roundNumber}`;
    }

    else if (combatStatus === CombatTrackerStatus.NotStarted)
    {
        return 'Not Started';
    }

    else if (combatStatus === CombatTrackerStatus.Completed)
    {
        return 'Complete';
    }

    return ' ';
}

function getCombatTrackerEmbedMessage({
    combatName,
    combatStatus,
    roundNumber,
    characters,
}: CombatTrackerEmbedParameters)
{
    const fields = getCharacterFields(characters);

    const description = getDescription({ combatStatus, roundNumber });

    const embed = new EmbedBuilder()
        .setTitle(combatName || 'Current Combat:')
        .setDescription(description)
        .setColor(combatTrackerColor)
        .setFields(...fields);

    return embed;
}

export async function updateCombatTrackerEmbedMessage(parameters: CombatTrackerEmbedParameters & {
    interaction: CommandInteraction | StringSelectMenuInteraction | ModalSubmitInteraction,
    actionRows: ActionRowBuilder<StringSelectMenuBuilder>[],
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
        const response = await interaction.deferUpdate({
            fetchReply: true,
        });

        await response.edit({
            embeds: [embedMessage],
            components: actionRows,
        });
    }
}
