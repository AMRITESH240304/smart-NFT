const { network, getNamedAccounts, deployments} = require("hardhat");
const {
    developmentChains,
    networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const {storeImages,storeTokenUriMetadata} = require("../utils/uploadToPinata")
// const {ethers} = require("ethers")

const imagesLocation = "./images/randomNft"

const metadataTemplate = {
    name:"",
    description:"",
    image:"",
    attribute:[
        {
            trait_type:"Cuteness",
            value:100,
        },
    ],
}

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    
    if(process.env.UPLOAD_TO_PINATA == "true"){
        tokenUris = await handleTokenUris()
    }

    let vrfCoordinatorV2Address, subscriptionId;

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract(
            "VRFCoordinatorV2Mock"
        );
        // console.log(vrfCoordinatorV2Address)
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        // console.log(vrfCoordinatorV2Address)
        const tx = await vrfCoordinatorV2Mock.createSubscription();
        const txReceipt = await tx.wait(1);

        subscriptionId = txReceipt.events[0].args.subId;
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
        subscriptionId = networkConfig[chainId].subscriptionId;
    }

    log("----------------------------------");

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].mintFee,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
        deployer
    ];
    
    const randomIpfsNft = await deploy("RandomIpfsNft",{
        from:deployer,
        args:args,
        log:true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("----------------------------------"); 

    if(!developmentChains.includes(network.name)){
        log("Verifying .......")
        await verify(randomIpfsNft.address,args)
    }
};


async function handleTokenUris(){
    tokenUris = []

    const {responses:imageUploadResponse,files} = await storeImages(imagesLocation)

    for (const imageUploadResponseIndex in imageUploadResponse){
        let tokeUriMetadata = {...metadataTemplate}

        tokeUriMetadata.name = files[imageUploadResponseIndex].replace(".png","")
        tokeUriMetadata.description = `An adorable ${tokeUriMetadata.name} pup!`
        tokeUriMetadata.image = `ipfs://${imageUploadResponse[imageUploadResponseIndex].IpfsHash}`
        console.log(`Uploading ${tokeUriMetadata.name} ....`)
        
        const metadataUploadResponse = await storeTokenUriMetadata(tokeUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("token URI uploaded! They are:")
    console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all","randomIpfs","main"]