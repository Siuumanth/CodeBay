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


// Put object command is for putting files in S3
// codebay-outputs
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.IAM_ACCESS_KEY,
        secretAccessKey: process.env.IAM_SECRET_KEY
    }
})

const PROJECT_ID = process.env.PROJECT_ID

const init = async () => {
    console.log("Executing script")
    const outDirPath = path.join(__dirname, "output") // dist files

    // all the source code goes to output folder
    // After building, the compiled code goes to dist folder
    // We have to upload this to S3

    // executing build commands
    const p = exec(`cd ${outDirPath} && npm install && npm run build`)
    
    // Print output of logs
    // Tracking execution of our commands
    p.stdout.on('data', function(data) {
        console.log(data.toString());
    });
    
    // Print errors
    p.stderr.on('data', function(data) {
        console.log("Error",data.toString());
    });
    
    // Completed exectin successfully
    p.on('close', async () => {
        console.log(" Build complete");

        const distFolderPath = path.join(__dirname, 'output', 'dist')
        // After building, dist will have all the output static files
        
        // Reading dist folder, and storing all files in an array recursively
        const distFolderContents = fs.readdirSync(distFolderPath, {recursive: true})

        // While uploading files on s3, we have to give only file paths, not dir path, so we need to check
 
        for( const relativePath  of distFolderContents ) { // looping through all files in dist folder
            const filePath = path.join(distFolderPath, relativePath )
            if(fs.lstatSync(filePath).isDirectory()) continue; // skip directories, only apply on files

            console.log(`Uploading ${filePath}`)
 
            // in S3 bucket, all files will be stored in __outputs folder
            const command = new PutObjectCommand({
                Bucket: 'codebay-outputs',
                // Dist contents will be in outputs/PID/
                Key: `__outputs/${PROJECT_ID}/${relativePath}`,
                // Body is the actual content we are uplaoding to S3
                Body: fs.createReadStream(filePath),        
                // creating a stream for uplaoding
                contentType: mime.lookup(filePath)          
                // mime will auto detect file type and send
            })
            
            await s3Client.send(command);  // After tis, the files will start uploading in s3 bucket

            console.log(`Uploaded`)
        };

        console.log('DONE MAN....')
    })

}

init()

/*
fs.createReadStream(filePath) lets you upload large files to S3 efficiently by streaming them in chunks instead of loading the whole file into memory.
*/