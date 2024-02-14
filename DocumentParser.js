import { readFileSync } from 'fs';
import { resolve } from 'path';

class DocumentParser {
    constructor(filename) {
        this.keywords = new Map();
        this.stopWords = new Set(["a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "if", "in", "into", "is", "it", "no", "not", "of", "on", "or", "such", "that", "the", "their", "then", "there", "these", "they", "this", "to", "was", "will", "with"]);

        try {
            this.fileContent = readFileSync(resolve(filename), 'utf-8');
        } catch (e) {
            console.error("File not found");
            return;
        }
        this.indexFile(this.fileContent);
    }

    indexFile(content) {
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
            } else {
                wordCount.set(word, 1);
            }
        }
        return wordCount;
    }

    isStopWord(word) {
        return this.stopWords.has(word);
    }

    printKeywords() {
        for (let [keyword, count] of this.keywords.entries()) {
            console.log(`${keyword} : ${count}`);
        }
    }
}


const parser = new DocumentParser('./resources/56667-0.txt');
parser.printKeywords();