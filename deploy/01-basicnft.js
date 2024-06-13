// console.log("not ready for development")

const {network, getNamedAccounts, deployments} = require("hardhat")
const {developmentChains} = require("../helper-hardhat-config")
const {verify} = require("../utils/verify")

module.exports = async({getNamedAccounts,deployments}) => {
    const {deploy,log} = deployments
    const {deployer} = await getNamedAccounts()

    log(`---------------------------------`)
    const arguments = []
    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if(!developmentChains.includes(network.name)){
        log("Verifying .......")
        await verify(basicNft.address,arguments)
    }

    log(`---------------------------------`)
}

module.exports.tags = ["all","basicNft","main"]