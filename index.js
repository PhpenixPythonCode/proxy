const puppeteer = require('puppeteer')
const mock = require('mock-browser').mocks.MockBrowser
const absolutify = require('absolutify')
const https = require('https')
const cheerio = require('cheerio')
const cors = require('cors')
var express = require('express')
 
var app = express()
 
app.use(express.json());
app.use(express.urlencoded());
var port = 3001

const fetch = (method, url, payload=undefined) => new Promise((resolve, reject) => {
    https.get(
        url,
        res => {
            const dataBuffers = []
            res.on('data', data => dataBuffers.push(data.toString('utf8')))
            res.on('end', () => resolve(dataBuffers.join('')))
        }
    ).on('error', reject)
})

const scrapeHtml = url => new Promise((resolve, reject) =>{
    fetch('GET', url)
    .then(html => {
      const cheerioPage = cheerio.load(html)

      const productTable = cheerioPage('table .productData')
  

      const cheerioProductTable = cheerio.load(productTable)
      const productRows = cheerioProductTable('tr')
  
      let i = 0
      let cheerioProdRow, prodRowText
      const productsTextData = []
      while(i < productRows.length) {
        cheerioProdRow = cheerio.load(productRows[i])
        prodRowText = cheerioProdRow.text().trim()
        productsTextData.push(prodRowText)
        i++
      }
      resolve(productsTextData)
    })
    .catch(reject)
  })


app.get('/', async (req,res) => {
    var {url} = req.query
    
    if(!url || url == ''){
        return res.send('No url provided')
    }else{
        if(url.startsWith('http')) url = url.replace(/^(http:\/\/\.|https:\/\/\.|http:\/\/|https:\/\/)/, '')
        console.log(url)
        try{
            const fetch = require('node-fetch');

            const getHTML = async () => {
                const response = await fetch('https://'+url);
                var body = await response.text();
                body = absolutify(body, `/?url=${url.split('/')[0]}`)
                // body = urlify(body)
                // body = body.replaceAll('http', '/?url=http')
                console.log(url,'has been loaded');
                return res.send(body)
            };
            getHTML()
        }catch(err){
            console.log(err)
            return res.send(err)
        }
        
    }
})

//Handling POST requests:

app.post('/', async (req,res) => {
    var {url} = req.query
    
    if(!url){
        console.error('Error: No URL provided')
        return res.send('No url provided')
    }else{
        if(url.startsWith('http')) url = url.replace(/^(http:\/\/\.|https:\/\/\.|http:\/\/|https:\/\/)/, '')
        console.log(url)
        try{
            const fetch = require('node-fetch');
            
            const getHTML = async () => {
                const response = await fetch('https://'+url, {
                    method: "post",
                    body: req.body,
                    headers: { "Content-Type": "application/json" }
                });
                var body = await response.json()
                
                console.log(url,'(POST) has been posted with a body of', req.body);
                return res.send(body)
            };
            getHTML()
        }catch(err){
            console.log(err)
            return res.send(err)
            
        }
        
    }
})



function urlify(text) {
    var urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    return text.replace(urlRegex, function(url) {
        return '/?url='+url;
    })
}

app.listen(port, () => {
    console.log('proxy server running! http://localhost:' + port)
})
