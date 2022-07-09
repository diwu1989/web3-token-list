import AvalancheTokens from "./build/43114-tokens.json";
import AvalancheFreshTokens from "./build/43114-fresh-tokens.json";
import CeloTokens from "./build/42220-tokens.json";
import CeloFreshTokens from "./build/42220-fresh-tokens.json";
import PolygonTokens from "./build/137-tokens.json";
import PolygonFreshTokens from "./build/137-fresh-tokens.json";
import AlfajoresTokens from "./build/44787-tokens.json";
import GnosisTokens from "./build/100-tokens.json";
import GnosisFreshTokens from "./build/100-fresh-tokens.json";
import OptimismTokens from "./build/10-tokens.json";
import OptimismFreshTokens from "./build/10-fresh-tokens.json";
import TronTokens from "./build/728126428-tokens.json";
import TronFreshTokens from "./build/728126428-fresh-tokens.json";

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
    gnosis: GnosisTokens,
    // optimism
    10: OptimismTokens,
    optimism: OptimismTokens,
    // tron
    728126428: TronTokens,
    tron: TronTokens,
};

export const FRESH_TOKEN_LIST: Record<number | string, Token[]> = {
    // celo
    42220: CeloFreshTokens,
    celo: CeloFreshTokens,
    // gnosis
    100: GnosisFreshTokens,
    gnosis: GnosisFreshTokens,
    // polygon
    137: PolygonFreshTokens,
    polygon: PolygonFreshTokens,
    // avalanche
    43114: AvalancheFreshTokens,
    avalanche: AvalancheFreshTokens,
    // optimism
    10: OptimismFreshTokens,
    optimism: OptimismFreshTokens,
    // tron
    728126428: TronFreshTokens,
    tron: TronFreshTokens,
}

export default TOKEN_LIST;
