const {google} = require('googleapis')
const customSearch = google.customsearch('v1')
const credentials = require('../data/credentials.json')

module.exports = {
    async searchImages(searchTerm, content){

        const searchThis = content === undefined ? searchTerm: `${searchTerm} ${content}`

        console.log('search this: '+searchThis);

        const response = await customSearch.cse.list({
            auth: credentials.customSearchApiKey,
            cx: credentials.cseId,
            q: searchThis,
            searchType: 'image',
            num: 1,
            imgSize: 'medium'
        })
        .catch(err=> console.log('erro: ' + err))

        return response.data.items[0].link
    }
}