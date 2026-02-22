import type { OracleStringSelectCustomId } from '../actionRowBuilders/types.js';

export type OracleGameCustomId = `${OracleStringSelectCustomId}:${string}`;

export function constructOracleGameCustomId(
    oracleGameId: string,
    componentCustomId: OracleStringSelectCustomId,
): OracleGameCustomId
{
    return `${componentCustomId}:${oracleGameId}`;
}

export function deconstructOracleGameCustomId(oracleGameCustomId: OracleGameCustomId): {
    oracleGameId: string;
    componentCustomId: OracleStringSelectCustomId;
}
{
    const [componentCustomId, oracleGameId] = oracleGameCustomId.split(':');

    return {
        oracleGameId,
        componentCustomId: componentCustomId as OracleStringSelectCustomId,
    };
}
