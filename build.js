#!/usr/bin/env node
require('dotenv').config()
const fs = require("fs")
const axios = require('axios').default
const utils = require('web3-utils')
const { createAlchemyWeb3 } = require('@alch/alchemy-web3')
const Promise = require('bluebird')
const ERC20ABI = require('./abis/ERC20.json')
const IUniswapV1FactoryABI = require('./abis/IUniswapV1Factory.json')
const TronMulticallABI = require('./abis/TronMulticall.json')
const TronWeb = require("tronweb")
const Web3 = require('web3')

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
        'https://raw.githubusercontent.com/centfinance/Symmetric.WebInterface-v2/symmetric-v2/src/data/listed.tokenlist.json',
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
        'https://ipfs.io/ipfs/QmUWnK6AFHZ3S1hR7Up1h3Ntax3fP1ZyiTptDNG2cWLTeK', // DXSwap
        'https://raw.githubusercontent.com/centfinance/Symmetric.WebInterface-v2/symmetric-v2/src/data/listed.tokenlist.json',
    ],
    // optimism
    10: [
        'https://raw.githubusercontent.com/sushiswap/list/master/lists/token-lists/default-token-list/tokens/optimism.json',
        'https://static.optimism.io/optimism.tokenlist.json',
        'https://data.zipswap.fi/tokenlist.json',
        'https://raw.githubusercontent.com/elkfinance/tokens/main/all.tokenlist.json',
        'https://docs.velodrome.finance/tokenlist.json',
    ],
    // tron
    728126428: [
        'https://list.justswap.link/justswap.json',
        'https://list.tronalliance.cc/tronalliance.json'
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
    10: 'https://rpc.ankr.com/optimism',
    // tron
    728126428: process.env.TRON_JSONRPC_URL,
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
        try {
            const toBlock = Math.min(latestBlock, fromBlock + blockIncrement)
            const pastTransfers = await erc20Contract.getPastEvents("Transfer", {
                fromBlock, toBlock
            })
            if (pastTransfers.length) {
                // found transfers, token is fresh enough
                return true
            }
        } catch (e) {
            if (e.message.includes('query returned more than 10000 results'))
                return true
            throw e
        }
    }
    return false
}

// filter for tokens that have had a transfer within recent blocks
async function filterFreshTokens(chainId, tokens, lookBackBlocks) {
    // number of blocks to look back to find transfers, ~6 days
    lookBackBlocks = lookBackBlocks || (chainId == 10 ? 500_000 : 100_000)
    const rpcUrl = RPC_URL[chainId]
    if (!rpcUrl) {
        // no rpc defined
        return []
    }
    const web3 = createAlchemyWeb3(rpcUrl)
    const latestBlock = await web3.eth.getBlockNumber()
    return await Promise.map(tokens, async (token) => {
        const tokenContract = new web3.eth.Contract(ERC20ABI, token.address)
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
            if (token.address.startsWith('T') && token.chainId == 1) {
                // Deal with Tron token
                token.address = TronWeb.address.toHex(token.address).replace('41', '0x')
                token.chainId = parseInt(chainId)
            }
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
        seen[token.address] = token
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

async function getTokenInfos(
    { web3, multicall, tokenAddrs, chainId }
) {
    const calls = []
    for (const tokenAddr of tokenAddrs) {
        const token = new web3.eth.Contract(ERC20ABI, tokenAddr)
        calls.push(
            [tokenAddr, token.methods.decimals().encodeABI()],
            [tokenAddr, token.methods.name().encodeABI()],
            [tokenAddr, token.methods.symbol().encodeABI()],
        )
    }
    const res = await multicall.methods.aggregate(calls)
        .call()
        .then(({returnData}) => returnData)
    const tokenInfos = []
    for (let i = 0; i < res.length - 3; i += 3) {
        const decimals = Number(web3.eth.abi.decodeParameter('uint8', res[i]))
        const name = web3.eth.abi.decodeParameter('string', res[i + 1])
        const symbol = web3.eth.abi.decodeParameter('string', res[i + 2])
        tokenInfos.push({
            address: tokenAddrs[i / 3],
            chainId,
            decimals,
            name,
            symbol,
        })
    }
    return tokenInfos;
}

async function tronUniV1Scan() {
    const web3 = new Web3(process.env.TRON_JSONRPC_URL)
    const multicall = new web3.eth.Contract(TronMulticallABI, '0xb8F050B6745510b005E0dc941FcEc5614027d5B7');
    const factory = new web3.eth.Contract(IUniswapV1FactoryABI, '0xeEd9e56a5CdDaA15eF0C42984884a8AFCf1BdEbb');
    const numTokens = await factory.methods.tokenCount().call();
    const batchSize = 2000;

    // Fetch tokens
    const tokenCalls = []
    for (let i = 1; i <= numTokens; i += batchSize) {
        const upTo = Math.min(i + batchSize - 1, numTokens);
        const calls = []
        for (let j = i; j <= upTo; j++) {
            calls.push([
                factory.options.address,
                factory.methods.getTokenWithId(j).encodeABI(),
            ])
        }
        tokenCalls.push(calls)
    }
    const tokens = await Promise.all(tokenCalls.map((tokenCall) => {
        return multicall.methods.aggregate(tokenCall)
            .call()
            .then(({returnData}) =>
                returnData.map(
                    (data) => web3.eth.abi.decodeParameter('address', data)
                )
            )
    })).then((arr) => arr.flat());
    console.info(`Fetched ${tokens.length} tokens`);

    // Fetch exchanges
    const exchangeCalls = []
    for (let i = 0; i < tokens.length; i += batchSize) {
        const calls = []
        const upTo = Math.min(i + batchSize, tokens.length);
        for (let j = i; j < upTo; j++) {
            calls.push([
                factory.options.address,
                factory.methods.getExchange(tokens[j]).encodeABI(),
            ])
        }
        exchangeCalls.push(calls)
    }
    const exchanges = await Promise.all(exchangeCalls.map((exchangeCall) => {
        return multicall.methods.aggregate(exchangeCall)
            .call()
            .then(({returnData}) =>
                returnData.map(
                    (data) => web3.eth.abi.decodeParameter('address', data)
                )
            )
    })).then((arr) => arr.flat());
    console.info(`Fetched ${exchanges.length} exchanges`);

    // Fetch exchange TRX liquidities
    const balanceCalls = []
    for (let i = 0; i < exchanges.length; i += batchSize) {
        const calls = []
        const upTo = Math.min(i + batchSize, exchanges.length);
        for (let j = i; j < upTo; j++) {
            calls.push([
                multicall.options.address,
                multicall.methods.getTrxBalance(exchanges[j]).encodeABI(),
            ])
        }
        balanceCalls.push(calls)
    }
    const balances = await Promise.all(balanceCalls.map((balanceCall) => {
        return multicall.methods.aggregate(balanceCall)
            .call()
            .then(({returnData}) =>
                returnData.map(
                    (data) => web3.eth.abi.decodeParameter('uint256', data)
                )
            )
    })).then((arr) => arr.flat());
    console.info(`Fetched ${balances.length} balances`);

    const zipped = []
    for (let i = 0; i < balances.length; i++) {
        zipped.push([tokens[i], exchanges[i], balances[i]])
    }

    const freshTokens = []
    for (const [token, _, trxBalance] of zipped) {
        if (Number(utils.fromWei(trxBalance, "mwei")) > 15_000_000) {
            freshTokens.push(token)
        }
    }
    return await getTokenInfos({ web3, multicall, tokenAddrs: freshTokens, chainId: 728126428 })
}

async function run(networkId) {
    for (const chainId in TOKEN_LIST) {
        if (networkId && chainId !== networkId) {
            console.info(`skipping chain ${chainId}`)
            continue
        }
        const tokens = await generate(chainId)
        if (chainId === '728126428') {
            const tronScannedTokens = await tronUniV1Scan()
            console.log(`Fetched ${tronScannedTokens.length} tokens from Tron UniV1`)
            tokens.push(...tronScannedTokens)
        }
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

const networkId = process.argv[2]
run(networkId)
