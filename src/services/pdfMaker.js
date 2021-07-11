const puppeteer = require('puppeteer')

module.exports = {
    async makePDF(path){
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox','--disable-setuid-sandbox']
          })

        const page = await browser.newPage()

        await page.goto(`https://wikipedia-to-pdf.herokuapp.com/result/${path}`,{
            waitUntil: "networkidle0"
        })

        const pdf = await page.pdf({
            format: 'letter',
            printBackground: true,
            margin: {
                top: '10mm',
                bottom: '10mm',
                left: '5mm',
                right: '5mm'
            }
        })

        await browser.close()

        return pdf
    }
}