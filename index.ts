import AvalancheTokens from "./build/43114-tokens.json";
import CeloTokens from "./build/42220-tokens.json";
import PolygonTokens from "./build/137-tokens.json";
import AlfajoresTokens from "./build/44787-tokens.json";

type Token = {
    chainId: number;
    address: string;
    decimals: number;
    name: string;
    symbol: string;
    logoURI?: string;
};

const TOKEN_LIST: Record<number | string, Token[]> = {
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
};

export default TOKEN_LIST;
