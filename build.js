#!/usr/bin/env node
const fs = require("fs")
const axios = require('axios').default

const TOKEN_LIST = {
    // avalanche
    43114: 'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/joe.tokenlist.json',
    // celo
    42220: 'https://raw.githubusercontent.com/Ubeswap/default-token-list/master/ubeswap.token-list.json',
    // polygon
    137: 'https://raw.githubusercontent.com/sameepsi/quickswap-default-token-list/master/src/tokens/mainnet.json'
}

function validateToken(chainId, token) {
    if (!token.address || !token.decimals || !token.chainId || !token.symbol) {
        return false
    }
    return parseInt(token.chainId) == parseInt(chainId)
}

async function generate(chainId) {
    const tokenListUrl = TOKEN_LIST[chainId]
    if (!tokenListUrl) {
        return
    }
    let additions = []
    try {
        additions = require(`./additions/${chainId}`)
    } catch (err) {
        // ignore missing additions
    }

    const response = await axios.get(tokenListUrl)
    let rawTokens = response.data
    if (Array.isArray(rawTokens)) {
        // token is already array, just append new ones in
    } else {
        rawTokens = rawTokens.tokens
    }

    // remove duplicate tokens
    let seen = {}
    for (const token of rawTokens) {
        seen[token.address.toLowerCase()] = token
    }

    for (const token of additions) {
        let address = token.address.toLowerCase()
        if (!seen[address]) {
            seen[address] = token
        }
    }

    const combined = []
    for (const addr in seen) {
        const token = seen[addr]
        if (validateToken(chainId, token)) {
            combined.push(token)
        }
    }
    return combined
}

async function run() {
    for (const chainId in TOKEN_LIST) {
        const tokens = await generate(chainId)
        const outputFile = `./build/${chainId}-tokens.json`
        fs.writeFileSync(outputFile, JSON.stringify(tokens, null, 2))
        console.info(`network chain ${chainId}, ${tokens.length} tokens, output ${outputFile}`)
    }
}
run()