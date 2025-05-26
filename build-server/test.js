const fs = require("fs")

const distFolderContents = fs.readdirSync("D:/code/DSA with CPP", {recursive: true})

console.log(distFolderContents)