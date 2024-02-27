import axios, { AxiosResponse } from 'axios';
import ResultPage from '../Models/ResultPage.js';
import MongoService from './MongoService.js';
import Book from '../Models/Book.js';
import Constants from '../Tools/Constants.js';
import Config from '../Tools/Config.js';
import Logger from '../Tools/Logger.js';


class BookService {
    logger: Logger;

    constructor() {
        this.logger = Config.getLoggerInstance();
    }
    // Mets à jour la liste des livres dans la base de donnée.
    async UpdateBookList(url: string, mongoService: MongoService) {
        let bookCurrent: number = 0;
        const maxBook = Config.getInstance().getMaxBook();
        let stop = false;
        /*let book = await axios("https://gutendex.com/books/108");
        await mongoService.InsertBook(book.data);
        book = await axios("https://gutendex.com/books/48320");
        await mongoService.InsertBook(book.data);
        book = await axios("https://gutendex.com/books/2680");
        await mongoService.InsertBook(book.data);
        book = await axios("https://gutendex.com/books/1656");
        await mongoService.InsertBook(book.data);
        book = await axios("https://gutendex.com/books/3657");
        await mongoService.InsertBook(book.data);*/
        while (url) {
            // Obtiens les résultats d'une page.
            const response: AxiosResponse<ResultPage> = await axios.get(url);


            // Ajouter les résultats de la page actuelle à la liste
            const results: Book[] = response.data.results;

            for (const result of results) {
                try {
                    // Filtres du livre.
                    if (result.formats[Constants.FORMAT_HTML] == undefined || result.formats[Constants.FORMAT_TXT] == undefined) { //Manque html ou txt.
                        break;
                    }
                    // Limite du nombre de livres.
                    if (bookCurrent >= maxBook) {
                        stop = true;
                        break;
                    }
                    
                    // Vérifier le nombre de mots dans le livre
                    const wordCount = result.formats[Constants.FORMAT_TXT].split(/[^a-zA-Z]+/).length;
                    if (wordCount && parseInt(wordCount) >= 10000) {
                        //Insertion du livre.
                        await mongoService.InsertBook(result);
                        bookCurrent++;
                    }
                }
                catch (error: any) 
                {
                    this.logger.getLogger().error("Impossible d'insérer un livre à l'url : ", url, error);
                }
            }
            if (stop) 
            {
                break;
            }
            // Mettre à jour l'URL pour la prochaine page
            url = response.data.next || ''; // vérification qu'il existe une page suivante.
        }
    }

    // Execute la logique métier.
    async main() {
        this.logger.getLogger().info("Début de la mise à jour de la table des livres.");
        // Connection à la base.
        const mongoService = new MongoService(Config.getInstance().getMongoDbUrl());
        await mongoService.OpenConnection();
        mongoService.SetCollection(Constants.MONGO_BOOK_COLLECTION);

        // Mise à jour des livres.
        await this.UpdateBookList(Config.getInstance().getGutendexUrl(), mongoService);

        // Fermer la connexion à la base de données
        await mongoService.CloseConnection();
        this.logger.getLogger().info("Fin de la mise à jour de la table des livres.");
    }
}

export default BookService;