import MongoService from '../Index/Services/MongoService.js';
import Config from '../Index/Tools/Config.js';
import Constants from '../Index/Tools/Constants.js';
import Tokenizer from '../Index/Tools/Tokenizer.js';
class SearchService {
    logger;
    reverseIndex = null;
    constructor() {
        this.logger = Config.getLoggerInstance();
    }
    async GetReverseIndex() {
        this.logger.getLogger().info("Chargement de l'index inversé.");
        // Connection à la base.
        const mongoService = new MongoService(Config.getInstance().getMongoDbUrl());
        await mongoService.OpenConnection();
        mongoService.SetCollection(Constants.MONGO_REVERSE_INDEX_COLLECTION);
        // Récupère l'index inversé.
        this.reverseIndex = await mongoService.GetAllReversedIndex();
        mongoService.CloseConnection();
    }
    async SimpleSearch(searchString) {
<<<<<<< HEAD
        let books = [];
        books = await this.GetBooks(this.OrderByScore(this.Search(searchString, false)));
        console.log("simplesearch", books);
        return books;
=======
        return await this.GetBooks(this.OrderByScore(await this.Search(searchString, false)));
>>>>>>> b3eb5ec03c5f29127ff9d881cfb2b00587b43b8a
    }
    async AdvancedSearch(searchRegex) {
        return await this.GetBooks(this.OrderByScore(await this.Search(searchRegex, true)));
    }
    async Search(searchString, useRegex) {
        let totalOccurences = [];
        if (useRegex) {
            const tokenRecords = this.RegexSearch(searchString);
            if (tokenRecords) {
                totalOccurences = tokenRecords;
            }
        }
        else {
            const tokens = Tokenizer.Tokenize(searchString);
            tokens?.forEach((token) => {
                const tokenRecord = this.TokenSearch(token);
                if (tokenRecord) {
                    totalOccurences.push(tokenRecord);
                }
            });
        }
        // Calculer un score un peu plus complexe?
        totalOccurences = await this.CalculateTfIdf(totalOccurences);
        return this.ResultSum(totalOccurences);
    }
    ResultSum(scores) {
        let result = {};
        scores.forEach((tokenScore) => {
            Object.entries(tokenScore).forEach(([bookId, score]) => {
                if (result[bookId]) {
                    result[bookId] += score;
                }
                else {
                    result[bookId] = score;
                }
            });
        });
        return result;
    }
    async CalculateTfIdf(scores) {
        // Connection à la base pour récupérer le nombre de mots de chaque livre.
        const mongoService = new MongoService(Config.getInstance().getMongoDbUrl());
        await mongoService.OpenConnection();
        mongoService.SetCollection(Constants.MONGO_BOOK_COLLECTION);
        const books = (await mongoService.GetAllBooks()).map(book => [book.id, book.words_count]);
        await mongoService.CloseConnection();
        const result = [];
        scores.forEach((tokenScore) => {
            const tokenResult = {};
            const IDF = Math.log((books.length + 1) / (Object.keys(tokenScore).length + 1));
            Object.entries(tokenScore).forEach(([bookId, score]) => {
                const wordCount = books.find(([string, _]) => string == bookId);
                if (wordCount) {
                    const TF = score / wordCount[1];
                    const TFIDF = TF * IDF;
                    tokenResult[bookId] = TFIDF;
                }
            });
            result.push(tokenResult);
        });
        return result;
    }
    async GetBooks(scores) {
        const books = [];
        // Connection à la base.
        const mongoService = new MongoService(Config.getInstance().getMongoDbUrl());
        await mongoService.OpenConnection();
        mongoService.SetCollection(Constants.MONGO_BOOK_COLLECTION);
        for (const [bookId, score] of scores) {
            try {
                const bookIdParsed = parseInt(bookId, 10);
                if (!isNaN(bookIdParsed)) {
                    // Obtenir le livre par son ID et ajouter à la liste
                    const book = await mongoService.GetBook(bookIdParsed);
                    if (book) {
                        books.push(book);
                        console.log("GetBooks, ", book, books);
                    }
                    else
                        console.log("GetBooks, ", book, books);
                }
                else {
                    console.log(`La conversion de l'id ${bookId} en nombre a échoué.`);
                }
            }
            catch (error) {
                console.log(`Une erreur est survenue lors du traitement de ${bookId}:`, error);
            }
        }
        console.log("gtBooks", books);
        await mongoService.CloseConnection();
        return books;
    }
    OrderByScore(scores) {
        const entriesArray = Object.entries(scores);
        entriesArray.sort((a, b) => b[1] - a[1]);
        return entriesArray;
    }
    TokenSearch(searchToken) {
        const result = this.reverseIndex?.find((element) => element.token === searchToken);
        return result ? result.books : null;
    }
    RegexSearch(searchRegex) {
        const regEx = new RegExp(searchRegex);
        const results = this.reverseIndex?.filter((element) => regEx.test(element.token))
            .map((result) => result.books);
        return results ? results : null;
    }
}
<<<<<<< HEAD
export default SearchService;
=======
const config = Config.getInstance();
const execute = new SearchService();
await execute.GetReverseIndex();
const simple = await execute.SimpleSearch("jesus and abraham");
const regex = await execute.AdvancedSearch("^je.+");
>>>>>>> b3eb5ec03c5f29127ff9d881cfb2b00587b43b8a
