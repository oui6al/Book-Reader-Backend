class ForwardIndexDocument {
    keywords;
    stopWords;
    constructor(content) {
        this.keywords = new Map();
        this.stopWords = new Set(["a", "an", "and", "are", "were", "as", "at", "be", "but", "by", "for", "if", "in", "into", "is", "it", "no", "not", "of", "on", "or", "such", "that", "the", "their", "then", "there", "these", "they", "this", "to", "was", "will", "with"]);
        const wordCount = this.countWords(content);
        for (let [word, count] of wordCount.entries()) {
            if (!this.isStopWord(word)) {
                this.keywords.set(word, count);
            }
        }
    }
    countWords(content) {
        const wordCount = new Map();
        const words = content.split(/[^a-zA-Z]+/);
        for (let word of words) {
            if (wordCount.has(word)) {
                wordCount.set(word, wordCount.get(word) + 1);
            }
            else {
                wordCount.set(word, 1);
            }
        }
        return wordCount;
    }
    isStopWord(word) {
        return this.stopWords.has(word.toLowerCase()) || word.length === 1;
    }
    printKeywords() {
        for (let [keyword, count] of this.keywords.entries()) {
            console.log(`${keyword} : ${count}`);
        }
    }
}
export default ForwardIndexDocument;
