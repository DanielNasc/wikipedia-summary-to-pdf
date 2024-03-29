const algorithmiaController = require('./algorithmiaController')
const customSearch = require('../services/seachImages')
const PdfMaker = require('../services/pdfMaker')
const mongodb = require('../services/mongoDb')

module.exports = { 
    async save(req, res){
        
        //VARIABLES==================================================================================

        const wikicontent = {}
        const body = req.body
        const searchTerm = body.searchTerm
        const lang = body.lang
        const searchTermTrimmed = searchTerm.toLowerCase().replace(/ /g, '_')
        const id = `${searchTermTrimmed}_${lang}`

        //LANGUAGE COOKIE============================================================================

        let cookieLanguage = req.cookies.lang

        if(cookieLanguage != lang){
            cookieLanguage = lang
            console.log('> cookie: '+cookieLanguage)
            res.cookie('lang', cookieLanguage)
        }

        //CHECK======================================================================================

        const checkIfTheTemporaryJSONHasTHisSearch = await mongodb.find(id)
        if(checkIfTheTemporaryJSONHasTHisSearch){
            console.log('> checked: contains: ' +id)

            const pdf = await PdfMaker.makePDF(id)
            console.log('> pdf loaded')
            res.contentType('application/pdf')

            return res.send(pdf)
        }

        console.log("> checked: doesn't contains")

        //ADD PROPERTIES=============================================================================

        wikicontent.title = searchTerm
        wikicontent._id = id
        console.log('> Title added: ' + searchTerm)

        const algorithmiaResponse = await algorithmiaController.searchInWikipedia(searchTerm, lang)
        
        if(!algorithmiaResponse) return res.redirect('/ops')

        wikicontent.content = algorithmiaResponse[0]
        wikicontent.summary = algorithmiaResponse[1]
        console.log('> content loaded');


        wikicontent.img = await customSearch.searchImages(searchTerm) 
        //if "Quota exceeded for quota metric 'Queries' and limit 'Queries per day'" use this 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Mallard2.jpg/1200px-Mallard2.jpg'
        console.log('> img loaded'); 

        await mongodb.insert({...wikicontent})

        //return res.redirect('/result/'+wikicontent._id)

        //GENERATE PDF===============================================================================
        
        const pdf = await PdfMaker.makePDF(wikicontent._id)
        .catch(e=>console.log(e)) 
        
        console.log('> pdf loaded');

        //RESPONSE===================================================================================

        res.contentType('application/pdf')

        return res.send(pdf)
    },
    async render(req, res){
        const searchId = req.params.path
        const wikicontent = await mongodb.find(searchId)

        if(!wikicontent) return res.status(404).send('<h1>Page not Found</h1>')

        return res.render('wikipedia-result', {wikicontent})
    },
    erro(req,res){
        const lang = req.cookies.lang
        const alert = lang == 'pt'? 'Pagina não encontrada :( tente pesquisar termos semelhantes': 'Page not found :( try searching for more specific terms'
        return res.render('ops',{alert} )
    }
}