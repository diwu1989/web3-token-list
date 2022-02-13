"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _43114_tokens_json_1 = __importDefault(require("./build/43114-tokens.json"));
const _42220_tokens_json_1 = __importDefault(require("./build/42220-tokens.json"));
const _137_tokens_json_1 = __importDefault(require("./build/137-tokens.json"));
const _44787_tokens_json_1 = __importDefault(require("./build/44787-tokens.json"));
const _100_tokens_json_1 = __importDefault(require("./build/100-tokens.json"));
const TOKEN_LIST = {
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
    gnosis: _100_tokens_json_1.default
};
exports.default = TOKEN_LIST;
