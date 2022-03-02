export declare type Token = {
    chainId: number;
    address: string;
    decimals: number;
    name: string;
    symbol: string;
    logoURI?: string;
};
declare const TOKEN_LIST: Record<number | string, Token[]>;
export default TOKEN_LIST;
