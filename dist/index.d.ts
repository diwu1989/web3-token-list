export declare type Token = {
    chainId: number;
    address: string;
    decimals: number;
    name: string;
    symbol: string;
    logoURI?: string;
};
export declare const TOKEN_LIST: Record<number | string, Token[]>;
export declare const FRESH_TOKEN_LIST: Record<number | string, Token[]>;
export default TOKEN_LIST;
