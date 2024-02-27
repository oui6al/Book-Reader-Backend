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
    SimpleSearch(searchString) {
        return this.OrderByScore(this.Search(searchString, false));
    }
    AdvancedSearch(searchRegex) {
        return this.OrderByScore(this.Search(searchRegex, true));
    }
    Search(searchString, useRegex) {
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
const config = Config.getInstance();
const logger = Config.getLoggerInstance();
const execute = new SearchService();
await execute.GetReverseIndex();
const simple = execute.SimpleSearch("jesus and abraham");
const regex = execute.AdvancedSearch("^je.+");
