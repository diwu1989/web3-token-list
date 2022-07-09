"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRESH_TOKEN_LIST = exports.TOKEN_LIST = void 0;
const _43114_tokens_json_1 = __importDefault(require("./build/43114-tokens.json"));
const _43114_fresh_tokens_json_1 = __importDefault(require("./build/43114-fresh-tokens.json"));
const _42220_tokens_json_1 = __importDefault(require("./build/42220-tokens.json"));
const _42220_fresh_tokens_json_1 = __importDefault(require("./build/42220-fresh-tokens.json"));
const _137_tokens_json_1 = __importDefault(require("./build/137-tokens.json"));
const _137_fresh_tokens_json_1 = __importDefault(require("./build/137-fresh-tokens.json"));
const _44787_tokens_json_1 = __importDefault(require("./build/44787-tokens.json"));
const _100_tokens_json_1 = __importDefault(require("./build/100-tokens.json"));
const _100_fresh_tokens_json_1 = __importDefault(require("./build/100-fresh-tokens.json"));
const _10_tokens_json_1 = __importDefault(require("./build/10-tokens.json"));
const _10_fresh_tokens_json_1 = __importDefault(require("./build/10-fresh-tokens.json"));
const _728126428_tokens_json_1 = __importDefault(require("./build/728126428-tokens.json"));
const _728126428_fresh_tokens_json_1 = __importDefault(require("./build/728126428-fresh-tokens.json"));
exports.TOKEN_LIST = {
    // avalanche
    43114: _43114_tokens_json_1.default,
    avalanche: _43114_tokens_json_1.default,
    // celo
    42220: _42220_tokens_json_1.default,
    celo: _42220_tokens_json_1.default,
    // alfajores
    44787: _44787_tokens_json_1.default,
    alfajores: _44787_tokens_json_1.default,
    // polygon
    137: _137_tokens_json_1.default,
    polygon: _137_tokens_json_1.default,
    // gnosis
    100: _100_tokens_json_1.default,
    gnosis: _100_tokens_json_1.default,
    // optimism
    10: _10_tokens_json_1.default,
    optimism: _10_tokens_json_1.default,
    // tron
    728126428: _728126428_tokens_json_1.default,
    tron: _728126428_tokens_json_1.default,
};
exports.FRESH_TOKEN_LIST = {
    // celo
    42220: _42220_fresh_tokens_json_1.default,
    celo: _42220_fresh_tokens_json_1.default,
    // gnosis
    100: _100_fresh_tokens_json_1.default,
    gnosis: _100_fresh_tokens_json_1.default,
    // polygon
    137: _137_fresh_tokens_json_1.default,
    polygon: _137_fresh_tokens_json_1.default,
    // avalanche
    43114: _43114_fresh_tokens_json_1.default,
    avalanche: _43114_fresh_tokens_json_1.default,
    // optimism
    10: _10_fresh_tokens_json_1.default,
    optimism: _10_fresh_tokens_json_1.default,
    // tron
    728126428: _728126428_fresh_tokens_json_1.default,
    tron: _728126428_fresh_tokens_json_1.default,
};
exports.default = exports.TOKEN_LIST;
