#!/usr/bin/env node
const fs = require("fs")
const axios = require('axios').default
const utils = require('web3-utils')
const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
const Promise = require('bluebird')
const ERC20 = require('./erc20.json')

const TOKEN_LIST = {
    // avalanche
    43114: [
        'https://raw.githubusercontent.com/traderjoe-xyz/joe-tokenlists/main/joe.tokenlist.json',
        'https://raw.githubusercontent.com/sushiswap/default-token-list/master/tokens/avalanche.json',
        'https://raw.githubusercontent.com/pangolindex/tokenlists/main/pangolin.tokenlist.json',
    ],
    // celo
    42220: [
        'https://raw.githubusercontent.com/sushiswap/default-token-list/master/tokens/celo.json',
        'https://raw.githubusercontent.com/Ubeswap/default-token-list/master/ubeswap.token-list.json',
        'https://raw.githubusercontent.com/Ubeswap/default-token-list/master/ubeswap-experimental.token-list.json',
    ],
    44787: [
        'https://raw.githubusercontent.com/Ubeswap/default-token-list/master/ubeswap-experimental.token-list.json',
    ],
    // polygon
    137: [
        'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/polygon.json',
        'https://raw.githubusercontent.com/sameepsi/quickswap-default-token-list/master/src/tokens/mainnet.json',
        'https://raw.githubusercontent.com/BlockTimeWorld/SwapMatic/master/alpha.tokenlist.json',
    ],
    // gnosis
    100: [
        // 'https://unpkg.com/@1hive/default-token-list@latest/build/honeyswap-default.tokenlist.json',
        // 'https://raw.githubusercontent.com/elkfinance/tokens/main/xdai.tokenlist.json',
        'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/xdai.json',
        'https://raw.githubusercontent.com/sushiswap/default-token-list/master/tokens/xdai.json',
        'https://raw.githubusercontent.com/baofinance/tokenlists/main/xdai.json',
    ],
    // optimism
    10: [
        'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/optimism.json',
        'https://static.optimism.io/optimism.tokenlist.json',
        'https://data.zipswap.fi/tokenlist.json',
        'https://raw.githubusercontent.com/elkfinance/tokens/main/all.tokenlist.json',
        'https://docs.velodrome.finance/tokenlist.json',
    ]
}

const RPC_URL = {
    // celo
    42220: 'https://rpc.ankr.com/celo',
    // gnosis
    100: 'https://rpc.ankr.com/gnosis',
    // polygon
    137: 'https://rpc.ankr.com/polygon',
    // avalanche
    43114: 'https://rpc.ankr.com/avalanche',
    // optimism
    10: 'http://mainnet-replica.optimism.io'
}

function validateToken(chainId, token) {
    if (!token.address || !token.decimals || !token.chainId || !token.symbol) {
        return false
    }
    return parseInt(token.chainId) == parseInt(chainId)
}

async function isTokenFresh(erc20Contract, latestBlock, lookBackBlocks) {
    const blockIncrement = 2_000
    for (let fromBlock = latestBlock - blockIncrement;
        fromBlock > latestBlock - lookBackBlocks;
        fromBlock -= blockIncrement) {
        const toBlock = Math.min(latestBlock, fromBlock + blockIncrement)
        const pastTransfers = await erc20Contract.getPastEvents("Transfer", {
            fromBlock, toBlock
        })
        if (pastTransfers.length) {
            // found transfers, token is fresh enough
            return true
        }
    }
    return false
}

// filter for tokens that have had a transfer within recent blocks
async function filterFreshTokens(chainId, tokens, lookBackBlocks) {
    // number of blocks to look back to find transfers, ~6 days
    lookBackBlocks = lookBackBlocks || (chainId == 10 ? 1_000_000 : 100_000)
    const rpcUrl = RPC_URL[chainId]
    if (!rpcUrl) {
        // no rpc defined
        return []
    }
    const web3 = createAlchemyWeb3(rpcUrl)
    const latestBlock = await web3.eth.getBlockNumber()
    return await Promise.map(tokens, async (token) => {
        const tokenContract = new web3.eth.Contract(ERC20, token.address)
        if (await isTokenFresh(tokenContract, latestBlock, lookBackBlocks)) {
            console.info(`chain ${chainId} ${token.symbol} is fresh`)
            return token
        }
        return null
    }, {
        concurrency: 100
    }).filter(t => !!t)
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
            if (!validateToken(chainId, token)) {
                continue
            }
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

        const freshTokens = await filterFreshTokens(chainId, tokens)
        if (freshTokens.length) {
            fs.writeFileSync(`./build/${chainId}-fresh-tokens.json`, JSON.stringify(freshTokens, null, 2))
        }

        console.info(`chain ${chainId}, ${tokens.length} tokens, ${freshTokens.length} are fresh, output ${outputFile}`)
    }
    process.exit(0)
}
run()
