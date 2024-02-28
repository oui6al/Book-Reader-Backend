import Book from '../Index/Models/Book.js';
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

    async SimpleSearch(searchString: string): Promise<Array<Book>> {
        return await this.GetBooks(this.OrderByScore(await this.Search(searchString, false)));
    }

    async AdvancedSearch(searchRegex: string): Promise<Array<Book>>  {
        return await this.GetBooks(this.OrderByScore(await this.Search(searchRegex, true)));
    }

    async Search(searchString: string, useRegex: boolean): Promise<Record<string, number>> {
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

        totalOccurences = await this.CalculateTfIdf(totalOccurences);

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

    async CalculateTfIdf(scores : Array<Record<string, number>>)
    {
        // Connection à la base pour récupérer le nombre de mots de chaque livre.
        const mongoService = new MongoService(Config.getInstance().getMongoDbUrl());
        await mongoService.OpenConnection();
        mongoService.SetCollection(Constants.MONGO_BOOK_COLLECTION);
        const books: Array<[string, number]> = (await mongoService.GetAllBooks()).map(book => [book.id, book.words_count]);
        await mongoService.CloseConnection();

        const result : Array<Record<string, number>> = [];

        scores.forEach((tokenScore: Record<string, number>) => {
            const tokenResult : Record<string, number> = {};
            const IDF = Math.log((books.length + 1) / (Object.keys(tokenScore).length + 1));
            Object.entries(tokenScore).forEach(([bookId, score]) => {
                const wordCount = books.find(([string, _]) => string == bookId);
                if(wordCount)
                {
                    const TF = score / wordCount[1];
                    const TFIDF = TF * IDF;
                    tokenResult[bookId] = TFIDF;
                }
            });
            result.push(tokenResult);
        });

        return result;
    }

    async GetBooks(scores: [string, number][]): Promise<Array<Book>>
    {
        const books: Array<Book> = [];
        // Connection à la base.
        const mongoService = new MongoService(Config.getInstance().getMongoDbUrl());
        await mongoService.OpenConnection();
        mongoService.SetCollection(Constants.MONGO_BOOK_COLLECTION);
        
        for (const [bookId, score] of scores) {
            try {
              const bookIdParsed = parseInt(bookId, 10);
          
              if (!isNaN(bookIdParsed)) {
                // Obtenir le livre par son ID et ajouter à la liste
                const book: Book = await mongoService.GetBook(bookIdParsed);
                if (book) {
                  books.push(book);
                }
              } else {
                this.logger.getLogger().warn(`La conversion de l'id ${bookId} en nombre a échoué.`);
              }
            } catch (error : any) {
              this.logger.getLogger().error(`Une erreur est survenue lors du traitement de ${bookId}:`, error);
            }
          }
          await mongoService.CloseConnection();
          return books;
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

export default SearchService;