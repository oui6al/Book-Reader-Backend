import { MongoClient } from 'mongodb';
import Config from '../Tools/Config.js';
class MongoService {
    url;
    client = null;
    db = null;
    collection = null;
    logger;
    constructor(url) {
        this.logger = Config.getLoggerInstance();
        this.url = url;
    }
    async OpenConnection() {
        try {
            this.logger.getLogger().debug("Ouverture de la connexion vers : " + this.url);
            const client = await MongoClient.connect(this.url);
            this.client = client;
            this.db = this.client.db();
        }
        catch (error) {
            throw new Error("Impossible d'ouvrir la connexion vers : " + this.url, error);
        }
    }
    SetCollection(collectionName) {
        if (this.db) {
            try {
                this.logger.getLogger().debug("Ciblage de la collection : " + collectionName);
                this.collection = this.db.collection(collectionName);
            }
            catch (error) {
                throw new Error("Impossible de cibler la collection : " + collectionName, error);
            }
        }
        else {
            throw new Error('Database not connected. Call OpenConnection first.');
        }
    }
    async InsertBook(book) {
        if (this.collection) {
            try {
                const existingBook = await this.collection.findOne({ id: book.id });
                if (!existingBook) {
                    this.logger.getLogger().debug("Insertion du livre : Id = " + book.id + " Titre = " + book.title);
                    await this.collection.insertOne(book);
                }
            }
            catch (error) {
                this.logger.getLogger().error("Impossible d'insérer le livre : Id = " + book.id + " Titre = " + book.title, error);
            }
        }
        else {
            throw new Error('Insert book : Collection not set. Call SetConnection first.');
        }
    }
    async SetBookWordCount(bookId, wordCount) {
        if (this.collection) {
            try {
                await this.collection.updateOne({ id: bookId }, { $set: { words_count: wordCount } });
                this.logger.getLogger().debug("Mise à jour du nombre de mots dans le livre : Id = " + bookId);
            }
            catch (error) {
                this.logger.getLogger().error("Impossible de mettre à jour le nombre de mots dans le livre : Id = " + bookId, error);
            }
        }
        else {
            throw new Error('SetBookWordCount : Collection not set. Call SetConnection first.');
        }
    }
    async CheckIndex(indexId) {
        const existingIndex = await this.collection?.findOne({ id: indexId });
        if (!existingIndex) {
            return false;
        }
        return true;
    }
    async InsertIndex(index) {
        if (this.collection) {
            try {
                this.logger.getLogger().debug("Insertion de l'index : Id du livre = " + index.id);
                await this.collection.insertOne(index);
            }
            catch (error) {
                this.logger.getLogger().error("Impossible d'insérer l'index : Id du livre= " + index.id, error);
            }
        }
        else {
            throw new Error('Insert index : Collection not set. Call SetConnection first.');
        }
    }
    async InsertOrUpdateReverseIndex(reverseIndex) {
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
            catch (error) {
                this.logger.getLogger().error("Impossible de mettre à jour ou d'inserer l'index inversé: Token = " + reverseIndex.token, error);
            }
        }
        else {
            throw new Error('Insert reverse index : Collection not set. Call SetConnection first.');
        }
    }
    async getBook(bookId) {
        if (this.collection) {
            const existingIndex = await this.collection?.findOne({ id: bookId });
            if (existingIndex) {
                return existingIndex;
            }
            throw new Error("Unable to find the book with the id : " + bookId);
        }
        else {
            throw new Error('Get Book : Collection not set. Call SetConnection first.');
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
    async deleteBook(bookId) {
        if (this.collection) {
            try {
                this.logger.getLogger().debug("Suppression du livre : Id = " + bookId);
                await this.collection.deleteOne({ id: bookId });
            }
            catch (error) {
                this.logger.getLogger().error("Impossible de supprimer le livre : Id = " + bookId, error);
            }
        }
        else {
            throw new Error('Delete book : Collection not set. Call SetConnection first.');
        }
    }
    async GetAllIndex() {
        if (this.collection) {
            return this.collection.find({}).toArray();
        }
        else {
            throw new Error('Get index : Database not connected. Call ConnectToDatabase first.');
        }
    }
    async GetAllReversedIndex() {
        if (this.collection) {
            return this.collection.find({}).toArray();
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
