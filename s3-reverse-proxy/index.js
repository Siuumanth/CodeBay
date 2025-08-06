const express = require('express')
const httpProxy = require('http-proxy') // this is for building reverse proxy

const app = express()
const PORT = 8000   // Running reverse proxy on 8000

const BASE_PATH = 'https://codebay-outputs.s3.ap-south-1.amazonaws.com/__outputs'   // S3 bucket folder link

// Typical S3 static file URL is like:
// s3://codebay-outputs/__outputs/p1//home/app/output/dist/index.html

const proxy = httpProxy.createProxy()

app.use((req, res) => { // req will have the incoming URL
    const hostname = req.hostname; // Domain + subdomain
    const subdomain = hostname.split('.')[0];

    // 1st string before . is subdomain, after that is domain

    const resolvesTo = `${BASE_PATH}/subdomain`

})