import natural from "natural";
import { lemmatizer } from "lemmatizer";
class Tokenizer {
    static Tokenize(text) {
        const tokenizer = new natural.WordTokenizer();
        const stopWords = new Set(natural.stopwords);
        const tokens = tokenizer.tokenize(text)?.map(token => token.toLowerCase().replace(/^_+|_+$/g, ''));
        const lemmatizedTokens = tokens?.map(token => lemmatizer(token).replace(/^_+|_+$/g, ''));
        const filteredTokens = lemmatizedTokens?.filter(token => !stopWords.has(token));
        const test = filteredTokens?.filter(token => token.includes('_'));
        return filteredTokens;
    }
    static TokenizeText(text) {
        text = this.RemoveGutendexText(text);
        return this.Tokenize(text);
    }
    static RemoveGutendexText(text) {
        const startRegex = /\*\*\* START[^\n]*\*\*\*/;
        const endRegex = /\*\*\* END[^\n]*\*\*\*/;
        // Retire ce qui précède le ***START
        const startMatch = text.match(startRegex);
        if (startMatch && startMatch.index !== undefined) {
            const startIndex = startMatch.index + startMatch[0].length;
            text = text.substring(startIndex);
        }
        // Retire ce qui suite le ***END
        const endMatch = text.match(endRegex);
        if (endMatch && endMatch.index !== undefined) {
            const endIndex = endMatch.index + endMatch[0].length;
            text = text.substring(0, endIndex);
        }
        return text;
    }
}
/*const text = await axios.get("https://www.gutenberg.org/ebooks/1.txt.utf-8");
const execute = Tokenizer.TokenizeText(text.data);
let a = 2;*/
export default Tokenizer;
