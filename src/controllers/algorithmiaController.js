require('dotenv').config();
const algorithmia = require('algorithmia')
const algorithmiaKey = process.env.ALGORITHMIA_KEY
const sanitizeContent = require('../services/sanitizeContent')
const searchImg = require('../services/seachImages')

module.exports = {
    async searchInWikipedia(searchTerm, lang){

        //IF WIKIPEDIA PARSER DOESNT WORK===============================================
    //     const array = [
    //         '== title ==',
    //         '=== title2 ===',
    //         'lorem',
    //         '== title1 2 ==',
    //         '=== title2 2 ===',
    //         '======= ddd ========',
    //         'lorem2',
    //         '== title1 3 ==',
    //         '=== title2 3 ===',
    //         'lorem3',
    //         'lorem32',
    //         'lorem33',
    //         '== title4 ==',
    //         'lorem4',
    //         'lorem42',
    //         'lorem43'
    //     ]
        
    //     const org = sanitizeContent.organizeInArray(array)
    //    return [org, ['eee','eeeeee']] 

        const input = {
            'lang': lang,
            "articleName": searchTerm
        } 

        //GET WIKIPEDIA CONTENT==================================================================================

        const authenticedAlgorithmia = algorithmia.client(algorithmiaKey)
        const wikipediaParserApi = authenticedAlgorithmia.algo('web/WikipediaParser/0.1.2')
        const wikipediaContent = await wikipediaParserApi.pipe(input)

        if(!wikipediaContent.result) {console.log('> the Wikipedia content cannot be received'); return undefined}

        console.log('> wikipedia content received');

        //REMOVE BLANK LINES=====================================================================================

        const contentWithoutBlankLines = await sanitizeContent.removeBlankLines(wikipediaContent.result.content)
        const wikipediaSummary = await sanitizeContent.removeBlankLines(wikipediaContent.result.summary)

        console.log('> blank lines removed');

        //SUMMARIZER==============================================================================================

        const summarizer = authenticedAlgorithmia.algo('nlp/Summarizer/0.1.8')
        let summarizedContent = []
        await addSummarizedContent(contentWithoutBlankLines)
        console.log('> summarized content received');

        async function addSummarizedContent(content){
            for(const sentence of content){

                if(sentence == '== Notes ==' || sentence == '== Referências =='){
                    break;
                }

                if(sentence.startsWith('=')){
                    summarizedContent.push(sentence)
                    continue;
                }

                const summarized = await summarizeContent(sentence)
                summarizedContent.push(summarized.result)
            }
        }

        async function summarizeContent(sentence){
            const newSentence = await summarizer.pipe(sentence)
            return newSentence
        }

        //ORGANIZE CONTENT=========================================================================================
        
        const organizedContent = sanitizeContent.organizeInArray(summarizedContent)
        console.log('> successfully organized content');

        //ADD IMAGES===============================================================================================
        // organizedContent.forEach(async (element) => {
        //     const img = await searchImg.searchImages(searchTerm, element.title)
        //     element.img = img
        // })


        return [organizedContent, wikipediaSummary]
 
    }
}