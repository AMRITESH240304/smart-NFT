const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const pinataApiKey = process.env.PINATA_API_KEY
const pinatApiSecret = process.env.PINATA_API_SECRET_KEY
const pinata = new pinataSDK(pinataApiKey,pinatApiSecret)

async function storeImages(imagesFilePath){
    // console.log("i am just below start of function storeImage")
    const fullImagesPath = path.resolve(imagesFilePath)
    // console.log("i am here ",fullImagesPath)
    const files = fs.readdirSync(fullImagesPath)
    console.log(files)
    let responses = []
    console.log("Uploading to IPFS")
    for (const fileIndex in files) {
        console.log(`working on ${fileIndex}.....`);
        const fileName = files[fileIndex];
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${fileName}`);
        
        const options = {
            pinataMetadata: {
                name: fileName,
            },
        };

        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile, options);
            responses.push(response);
        } catch (error) {
            console.log(error);
        }
    }

    return {responses,files}
}

async function storeTokenUriMetadata(metadata){
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response;
    } catch (error) {
        console.log(error)
    }
}

module.exports = {storeImages,storeTokenUriMetadata }
