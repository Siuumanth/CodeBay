 require('dotenv').config()
 console.log(process.env.IAM_SECRET_KEY)


/*const fs = require("fs")

const distFolderContents = fs.readdirSync("D:/code/DSA with CPP", {recursive: true})

console.log(distFolderContents)*/







/*









const { exec } = require('child_process') 
// to run shell commands like 'npm install' or 'npm run build'
const path = require('path')          
// to handle file and folder paths safely across OS
const fs = require('fs')                  
// to read files and directories from the output folder
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
// to upload built files to AWS S3
const mime = require('mime-types')        
// to detect correct MIME types for S3 uploads

require('dotenv').config()                



const init = async () => {
    const outDirPath = path.join(__dirname, "output") // dist files

    // all the source code goes to output folder
    // After building, the compiled code goes to dist folder
    // We have to upload this to S3

    // executing build commands
    
    const funca = async () => {

        const distFolderPath = path.join(__dirname, 'output', 'dist')
        console.log(distFolderPath);

        
        // Reading dist folder, and storing all files in an array recursively
        const distFolderContents = fs.readdirSync(distFolderPath, {recursive: true})

 
        for( const relativePath  of distFolderContents ) { // looping through all files in dist folder

            // 1. Strip any leading slashes or backslashes:
            let cleaned = relativePath.replace(/^[/\\]+/, '');
            
            // 2. Turn all backslashes into forward-slashes:
            cleaned = cleaned.replace(/\\/g, '/');
            
            // 3. Build your S3 key:
            const Key = `__outputs/p1/${cleaned}`;

            const filePath = path.join(distFolderPath, relativePath )
            if(fs.lstatSync(filePath).isDirectory()) continue; // skip directories, only apply on files
            console.log(`Rel file path is  ${Key}`)

           // console.log(`Uploading ${filePath}`)
 
            // in S3 bucket, all files will be stored in __outputs folder
           // console.log(`Uploaded`)
        };

        console.log('DONE MAN....')
    }

    funca();

}

init()


fs.createReadStream(filePath) lets you upload large files to S3 efficiently by streaming them in chunks instead of loading the whole file into memory.
*/