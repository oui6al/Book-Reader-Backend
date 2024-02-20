
function ForwardIndexDocument(content) {
    const keywords = new Map();
    const stopWords = new Set(["a", "an", "and", "are", "were", "as", "at", "be", "but", "by", "for", "if", "in", "into", "is", "it", "no", "not", "of", "on", "or", "such", "that", "the", "their", "then", "there", "these", "they", "this", "to", "was", "will", "with"]);

    const wordCount = countWords(content);
    for (let [word, count] of wordCount.entries()) {
        if (isStopWord(word) == false) {
            keywords.set(word, count);
        }
    }

    function countWords(content) {
        const wordCount = new Map();
        const words = content.split(/[^a-zA-Z]+/);
        for (let word of words) {
            if (wordCount.has(word)) {
                wordCount.set(word, wordCount.get(word) + 1);
            } else {
                wordCount.set(word, 1);
            }
        }
        return wordCount;
    }

    function isStopWord(word) {
        return stopWords.has(word.toLowerCase()) || word.length == 1;
    }


    function printKeywords() {
        for (let [keyword, count] of keywords.entries()) {
            console.log(`${keyword} : ${count}`);
        }
    }

    return keywords;

}




export default ForwardIndexDocument;

