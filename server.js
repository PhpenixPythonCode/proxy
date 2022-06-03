const express = require('express')
const puppeteer = require('puppeteer')
const absolutify = require('absolutify')
var port = 3001

const app = express()

app.get('/', async (req,res) => {
    var {url} = req.query
    
    if(!url){
        return res.send('No url provided')
    }else{
        if(url.startsWith('http')) url = url.replace(/^(http:\/\/\.|https:\/\/\.|http:\/\/|https:\/\/)/, '')
        console.log(url)
        try{
            const browser = await puppeteer.launch()
            const page = await browser.newPage()
            
            await page.goto(`https://${url}`)

            let document = await page.evaluate(() => document.documentElement.outerHTML)
            if(!document || document == {}) return res.send('404')
            document = absolutify(document, `https://localhost:${port}/?url=${url.split('/')[0]}`)
            // document = urlify(document)
            browser.close()
            return res.send(document)
        }catch(err){
            return res.send(err)
        }
        
    }
})

function urlify(text) {
    var urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    return text.replace(urlRegex, function(url) {
        return '/?url='+url;
    })
}

app.listen(port, () => {
    console.log('proxy server running! http://localhost:' + port)
})
