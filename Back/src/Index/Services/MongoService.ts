import { MongoClient, Db, Collection } from 'mongodb';
import Book from '../Models/Book.js';
import Index from '../Models/Index.js';
import ReverseIndex from '../Models/ReverseIndex.js';
import Config from '../Tools/Config.js';
import Logger from '../Tools/Logger.js';

class MongoService {
    url: string;
    client: MongoClient | null = null;
    db: Db | null = null;
    collection: Collection | null = null;
    logger: Logger;

    constructor(url: string) {
        this.logger = Config.getLoggerInstance();
        this.url = url;
    }

    async OpenConnection(): Promise<void> {
        try {
            this.logger.getLogger().debug("Ouverture de la connexion vers : " + this.url);
            const client = await MongoClient.connect(this.url);
            this.client = client;
            this.db = this.client.db();
        }
        catch (error : any) 
        {
            throw new Error("Impossible d'ouvrir la connexion vers : " + this.url, error);
        }

    }

    SetCollection(collectionName: string) {
        if (this.db) {
            try {
                this.logger.getLogger().debug("Ciblage de la collection : " + collectionName);
                this.collection = this.db.collection(collectionName);
            }
            catch (error : any) {
                throw new Error("Impossible de cibler la collection : " + collectionName, error);
            }
        }
        else {
            throw new Error('Database not connected. Call OpenConnection first.');
        }
    }

    async InsertBook(book: Book) {

        if (this.collection) {
            try {
                const existingBook = await this.collection.findOne({ id: book.id });
                if (!existingBook) {
                    this.logger.getLogger().debug("Insertion du livre : Id = " + book.id + " Titre = " + book.title);
                    await this.collection.insertOne(book);
                }
            }
            catch (error : any) {
                this.logger.getLogger().error("Impossible d'insérer le livre : Id = " + book.id + " Titre = " + book.title, error);
            }
        }
        else {
            throw new Error('Insert book : Collection not set. Call SetConnection first.');
        }
    }

    async CheckIndex(indexId: number) {
        const existingIndex = await this.collection?.findOne({ id: indexId });
        if (!existingIndex) {
            return false;
        }
        return true;
    }

    async InsertIndex(index: Index) {

        if (this.collection) {
            try {
                this.logger.getLogger().debug("Insertion de l'index : Id du livre = " + index.id);
                await this.collection.insertOne(index);
            }
            catch (error : any) {
                this.logger.getLogger().error("Impossible d'insérer l'index : Id du livre= " + index.id, error);
            }
        }
        else {
            throw new Error('Insert index : Collection not set. Call SetConnection first.');
        }
    }

    async InsertOrUpdateReverseIndex(reverseIndex: ReverseIndex) {

        if (this.collection) {
            const existingReverseIndex = await this.collection.findOne({ token: reverseIndex.token });
            try {
                if (!existingReverseIndex) {
                    this.logger.getLogger().debug("Insertion de l'index inversé : Token = " + reverseIndex.token);
                    await this.collection.insertOne(reverseIndex);
                }

                else {
                    this.logger.getLogger().debug("Mise à jour de l'index inversé : Token = " + reverseIndex.token);
                    await this.collection.updateOne({ "token": reverseIndex.token }, { $set: { books: reverseIndex.books } });
                }
            }
            catch (error : any) {
                this.logger.getLogger().error("Impossible de mettre à jour ou d'inserer l'index inversé: Token = " + reverseIndex.token, error);
            }
        }
        else {
            throw new Error('Insert reverse index : Collection not set. Call SetConnection first.');
        }
    }

    async GetAllBooks() {
        if (this.collection) {
            return this.collection.find({}).toArray();
        }
        else {
            throw new Error('Get all books : Database not connected. Call ConnectToDatabase first.');
        }
    }

    async GetAllIndex(): Promise<Array<Index>> {
        if (this.collection) {
            return this.collection.find<Index>({}).toArray();
        }
        else {
            throw new Error('Get index : Database not connected. Call ConnectToDatabase first.');
        }
    }

    async GetAllReversedIndex(): Promise<Array<ReverseIndex>> {
        if (this.collection) {
            return this.collection.find<ReverseIndex>({}).toArray();
        }
        else {
            throw new Error('Get reverse index : Database not connected. Call ConnectToDatabase first.');
        }
    }

    async CloseConnection() {
        this.logger.getLogger().debug("Fermeture de la connexion : ", this.url);
        this.client?.close();
    }
}

export default MongoService;
