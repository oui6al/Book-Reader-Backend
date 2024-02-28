import Constants from "../Tools/Constants.js";
import MongoService from "./MongoService.js";
import Index from "../Models/Index.js"
import ReverseIndex from "../Models/ReverseIndex.js";
import Config from '../Tools/Config.js';
import Logger from '../Tools/Logger.js';
import Tokenizer from '../Tools/Tokenizer.js'
import CreateAxiosInstance from "./AxiosService.js";

class IndexService {
    logger : Logger;

    constructor(){
        this.logger = Config.getLoggerInstance();
    }

    async UpdateIndexList(books: Array<[number, string]>, mongoService: MongoService) {

        for (const book of books) {
            try {
                mongoService.SetCollection(Constants.MONGO_INDEX_COLLECTION);
                if (!await mongoService.CheckIndex(book[0])) {
                    const axiosInstance = CreateAxiosInstance(book[1], 10000);
                    const response = await axiosInstance.get(book[1]);
                    if (response.status == 200) {
                        const words = response.data.split(/[^a-zA-Z]+/);
                        const wordCount = words.length;
                        if(wordCount < 10000){
                            mongoService.SetCollection(Constants.MONGO_BOOK_COLLECTION);
                            await mongoService.deleteBook(book[0]);
                            continue;
                        }
                        const tokens = this.Tokenize(response.data);
                        const index = new Index(book[0], tokens);
                        await mongoService.InsertIndex(index);
                    }
                }
            }
            catch (error : any) {
                this.logger.getLogger().error("Impossible de mettre à jour l'index pour le livre : Id = " + book[0], error);
            }
        }
    }

    Tokenize(text: string): Record<string, number> {
        const tokenOccurrences: Record<string, number> = {};
        const tokens = Tokenizer.TokenizeText(text);

        tokens?.forEach(token => {
            // Si le token existe déjà dans l'objet, incrémentez le compteur
            if (tokenOccurrences[token]) {
                tokenOccurrences[token]++;
            } else {
                // Sinon, initialisez le compteur à 1
                tokenOccurrences[token] = 1;
            }
        });
        return tokenOccurrences;
    }

    async UpdateIndexReversed() {
        this.logger.getLogger().info("Début de la mise à jour de la table d'index inversés.");
        // Connection à la base.
        const mongoService = new MongoService(Config.getInstance().getMongoDbUrl());
        await mongoService.OpenConnection();
        mongoService.SetCollection(Constants.MONGO_INDEX_COLLECTION);

        // Récuperer tous les index de la collection.
        this.logger.getLogger().info("Obtention des index.");
        const index: Array<Index> = await mongoService.GetAllIndex();
        await mongoService.CloseConnection();

        // Obtention de l'index inversé.
        this.logger.getLogger().info("Création de l'index inversé.");
        const reverseIndex = this.CreateReverseIndex(index);

        // Ouverture connection vers la collection ReverseIndex.
        await mongoService.OpenConnection();
        mongoService.SetCollection(Constants.MONGO_REVERSE_INDEX_COLLECTION);

        // Insertion dans la collection ReverseIndex.
        this.logger.getLogger().info("Insertion des index inversés.");
        for (const [token, bookOccurrences] of Object.entries(reverseIndex)) {
            try {
                const element = new ReverseIndex(token, bookOccurrences);
                await mongoService.InsertOrUpdateReverseIndex(element);
            }
            catch (error: any) {
                this.logger.getLogger().error("Impossible d'insérer ou de mettre à jour l'index inversé :" + token, error);
            }
        }
        await mongoService.CloseConnection();
        this.logger.getLogger().info("Fin de la mise à jour de la table d'index inversés.");
    }

    CreateReverseIndex(index: Array<Index>) {
        // Index inversé
        const reverseIndex: Record<string, Record<number, number>> = {};

        // Parcourir l'index pour construire l'index inversé
        index.forEach((element) => {
            const { id, tokens } = element;

            Object.entries(tokens).forEach(([token, occurrences]) => {
                if (!reverseIndex[token]) {
                    reverseIndex[token] = {};
                }

                reverseIndex[token][id] = occurrences;
            });
        });

        return reverseIndex;
    }

    // Execute la logique métier.
    async UpdateIndex() {
        this.logger.getLogger().info("Début de la mise à jour de la table d'index.");
        // Connection à la base.
        const mongoService = new MongoService(Config.getInstance().getMongoDbUrl());
        await mongoService.OpenConnection();
        mongoService.SetCollection(Constants.MONGO_BOOK_COLLECTION);

        // Récupérer tous les livres de la collection
        this.logger.getLogger().info("Obtention des livres de la base de données.");
        const books: Array<[number, string]> = (await mongoService.GetAllBooks()).map(book => [book.id, book.formats[Constants.FORMAT_TXT]]);

        // Fermer la connexion à la base de données
        await mongoService.CloseConnection();

        // Indexation des livres.
        // Ouverture connection.
        await mongoService.OpenConnection();
        mongoService.SetCollection(Constants.MONGO_INDEX_COLLECTION);

        // Opération d'indexation.
        this.logger.getLogger().info("Insertion dans la table d'index.");
        await this.UpdateIndexList(books, mongoService);

        //Fermer la connexion.
        await mongoService.CloseConnection();
        this.logger.getLogger().info("Fin de la mise à jour de la table d'index.");

    }

    

    async main() {
        await this.UpdateIndex();
        await this.UpdateIndexReversed();
    }
}

export default IndexService;