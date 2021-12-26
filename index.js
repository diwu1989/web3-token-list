const TOKEN_LIST = {
    // avalanche
    43114: require('./build/43114-tokens.json'),
    avalanche: require('./build/43114-tokens.json'),
    // celo
    42220: require('./build/42220-tokens.json'),
    celo: require('./build/42220-tokens.json'),
    // polygon
    137: require('./build/137-tokens.json'),
    polygon: require('./build/137-tokens.json')
}

module.exports = TOKEN_LIST