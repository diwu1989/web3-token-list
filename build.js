#!/usr/bin/env node
const fs = require("fs")
const axios = require('axios').default
const utils = require("web3-utils")

const TOKEN_LIST = {
    // avalanche
    43114: [
        'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/joe.tokenlist.json',
        'https://raw.githubusercontent.com/sushiswap/default-token-list/master/tokens/avalanche.json'
    ],
    // celo
    42220: [
        'https://raw.githubusercontent.com/sushiswap/default-token-list/master/tokens/celo.json',
        'https://raw.githubusercontent.com/Ubeswap/default-token-list/master/ubeswap.token-list.json',
        'https://raw.githubusercontent.com/Ubeswap/default-token-list/master/ubeswap-experimental.token-list.json'
    ],
    44787: [
        'https://raw.githubusercontent.com/Ubeswap/default-token-list/master/ubeswap-experimental.token-list.json',
    ],
    // polygon
    137: [
        'https://raw.githubusercontent.com/sameepsi/quickswap-default-token-list/master/src/tokens/mainnet.json',
        'https://raw.githubusercontent.com/BlockTimeWorld/SwapMatic/master/alpha.tokenlist.json'
    ],
    // gnosis
    100: [
        'https://raw.githubusercontent.com/elkfinance/tokens/main/xdai.tokenlist.json',
        'https://raw.githubusercontent.com/sushiswap/default-token-list/master/tokens/xdai.json',
        'https://unpkg.com/honeyswap-default-token-list@3.1.1/build/honeyswap-default.tokenlist.json',
        'https://raw.githubusercontent.com/baofinance/tokenlists/main/xdai.json'
    ]
}

function validateToken(chainId, token) {
    if (!token.address || !token.decimals || !token.chainId || !token.symbol) {
        return false
    }
    return parseInt(token.chainId) == parseInt(chainId)
}

async function generate(chainId) {
    const tokenListUrls = TOKEN_LIST[chainId]
    if (!tokenListUrls) {
        return
    }
    let additions = []
    try {
        additions = require(`./additions/${chainId}`)
    } catch (err) {
        // ignore missing additions
    }

    let removals = []
    try {
        removals = require(`./removals/${chainId}`)
    } catch (err) {
        // ignore missing removals
    }

    // remove duplicate tokens
    let seen = {}

    for (tokenListUrl of tokenListUrls) {
        const response = await axios.get(tokenListUrl)
        let rawTokens = response.data
        if (Array.isArray(rawTokens)) {
            // token is already array, just append new ones in
        } else {
            rawTokens = rawTokens.tokens
        }

        for (const token of rawTokens) {
            token.address = utils.toChecksumAddress(token.address)
            seen[token.address] = token
        }
        console.info(`chain ${chainId} fetched ${rawTokens.length} tokens from ${tokenListUrl}`)
    }

    for (const token of additions) {
        token.address = utils.toChecksumAddress(token.address)
        if (!seen[token.address]) {
            seen[token.address] = token
        }
    }

    for (const token of removals) {
        delete seen[utils.toChecksumAddress(token.address)]
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
        console.info(`chain ${chainId}, ${tokens.length} tokens, output ${outputFile}`)
    }
}
run()
