import AvalancheTokens from "./build/43114-tokens.json";
import CeloTokens from "./build/42220-tokens.json";
import CeloFreshTokens from "./build/42220-fresh-tokens.json";
import PolygonTokens from "./build/137-tokens.json";
import AlfajoresTokens from "./build/44787-tokens.json";
import GnosisTokens from "./build/100-tokens.json";
import GnosisFreshTokens from "./build/100-fresh-tokens.json";

export type Token = {
    chainId: number;
    address: string;
    decimals: number;
    name: string;
    symbol: string;
    logoURI?: string;
};

export const TOKEN_LIST: Record<number | string, Token[]> = {
    // avalanche
    43114: AvalancheTokens,
    avalanche: AvalancheTokens,
    // celo
    42220: CeloTokens,
    celo: CeloTokens,
    // alfajores
    44787: AlfajoresTokens,
    alfajores: AlfajoresTokens,
    // polygon
    137: PolygonTokens,
    polygon: PolygonTokens,
    // gnosis
    100: GnosisTokens,
    gnosis: GnosisTokens
};

export const FRESH_TOKEN_LIST: Record<number | string, Token[]> = {
    // celo
    42220: CeloFreshTokens,
    celo: CeloFreshTokens,
    // gnosis
    100: GnosisFreshTokens,
    gnosis: GnosisFreshTokens
}

export default TOKEN_LIST;
