import ReverseIndex from '../Index/Models/ReverseIndex.js';
import MongoService from '../Index/Services/MongoService.js';
import Config from '../Index/Tools/Config.js';
import Constants from '../Index/Tools/Constants.js';
import Logger from '../Index/Tools/Logger.js';
import Tokenizer from '../Index/Tools/Tokenizer.js';

class SearchService {
    logger: Logger;
    reverseIndex: Array<ReverseIndex> | null = null;

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

    SimpleSearch(searchString: string): [string, number][] {
        return this.OrderByScore(this.Search(searchString, false));
    }

    AdvancedSearch(searchRegex: string): [string, number][] {
        return this.OrderByScore(this.Search(searchRegex, true));
    }

    Search(searchString: string, useRegex: boolean): Record<string, number> {
        let totalOccurences: Array<Record<string, number>> = [];
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

    ResultSum(scores: Array<Record<string, number>>): Record<string, number> {

        let result: Record<string, number> = {};

        scores.forEach((tokenScore: Record<string, number>) => {
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

    OrderByScore(scores: Record<string, number>): [string, number][]{
        const entriesArray = Object.entries(scores);
    
        entriesArray.sort((a, b) => b[1] - a[1]);
        return entriesArray;
    }

    TokenSearch(searchToken: string): Record<number, number> | null {
        const result = this.reverseIndex?.find((element) => element.token === searchToken);
        return result ? result.books : null;
    }

    RegexSearch(searchRegex: string): Array<Record<number, number>> | null {
        const regEx: RegExp = new RegExp(searchRegex);
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