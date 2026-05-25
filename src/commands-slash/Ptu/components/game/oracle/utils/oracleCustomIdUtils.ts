import type { OracleStringSelectCustomId } from '../actionRowBuilders/types.js';

export type OracleGameCustomId = `${OracleStringSelectCustomId}:${string}`;

export function constructOracleGameCustomId(
    oracleGameId: string,
    componentCustomId: OracleStringSelectCustomId,
    ...rest: string[]
): OracleGameCustomId
{
    return `${componentCustomId}:${oracleGameId}${rest.length > 0
        ? `:${rest.join(':')}`
        : ''
    }`;
}

export function deconstructOracleGameCustomId(oracleGameCustomId: OracleGameCustomId): {
    oracleGameId: string;
    componentCustomId: OracleStringSelectCustomId;
    restOfCustomId: string[];
}
{
    const [componentCustomId, oracleGameId, ...restOfCustomId] = oracleGameCustomId.split(':');

    return {
        oracleGameId,
        componentCustomId: componentCustomId as OracleStringSelectCustomId,
        restOfCustomId,
    };
}
