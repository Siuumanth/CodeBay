const express = require('express')
const httpProxy = require('http-proxy') // this is for building reverse proxy

const app = express()
const PORT = process.env.PORT || 8000   // Running reverse proxy on 8000

const BASE_PATH = 'https://codebay-outputs.s3.ap-south-1.amazonaws.com/__outputs'   // S3 bucket folder link

// Typical S3 static file URL is like:
// https://codebay-outputs.s3.ap-south-1.amazonaws.com/__outputs/p1/index.html

const proxy = httpProxy.createProxy()

// Main proxy handler
app.use((req, res) => { 
    const hostname = req.hostname; // subdomain + domain
    const subdomain = hostname.split('.')[0];   // 1st string before . is subdomain

    // Rewrite "/" to "/index.html", default behaviour
    if (req.url === '/') {
        req.url = '/index.html';
    }
    const url = req.url;

    // The incoming URL will be resolved to THIS URL by the reverse proxy
    const resolvesTo = `${BASE_PATH}/${subdomain}`

    // Actual function which resolves and maps the proxy request
    proxy.web(req, res, { 
        target: resolvesTo, 
        changeOrigin: true // Change origin header to match target
    })

    console.log(`Path resolved from ${url} to ${resolvesTo}`)
})

app.listen(PORT, () => console.log(`Reverse Proxy Running..${PORT}`))