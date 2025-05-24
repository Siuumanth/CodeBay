
const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3')
const mime = require('mime-types')

// Put object command is for putting files in S3

const s3Client = new S3Client({
    region: '',
    credentials: {
        accessKeyId: '',
        secretAccessKey: ''
    }
})

const PROJECT_ID = process.env.PROJECT_ID

const init = async () => {
    console.log("Executing script")
    const outDirPath = path.join(__dirname, "output")

    // all the source code goes to output folder
    // After building, the compiled code goes to dist folder
    // We have to upload this to S3

    // executing build commands
    const p = exec(`cd ${outDirPath} && npm install && npm run build`)
    
    // Print output of logs
    p.stdout.on('data', function(data) {
        console.log(data.toString());
    });
    
    // Print errors
    p.stderr.on('data', function(data) {
        console.log("Error",data.toString());
    });
    
    // Completed exectin successfully
    p.on('exit', async () => {
        console.log(" Build complete");

        const distFolderPath = path.join(__dirname, 'output', 'dist')
        
        // Reading dist folder, and storing all files in an array recursively
        const distFolderContents = fs.readdirSync(distFolderPath, {recursive: true})

        for( const filePath of distFolderContents ) { // looping through all files in dist folder
            if(fs.lstatSync(filePath).isDirectory()) continue; // skip directories, only apply on files

            
            const command = new PutObjectCommand({
                Bucket: '',
                Key: `__outputs/${PROJECT_ID}/${filePath}`,
                Body: fs.createReadStream(filePath),
                contentType: mime.lookup(filePath)
            })
            
            await s3Client.send(command);  // After tis, the files will start uploading in s3 bucket
        };

        console.log('Done....')
    })

}