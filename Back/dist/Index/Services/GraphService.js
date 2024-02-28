import Config from "../Tools/Config.js";
import Constants from "../Tools/Constants.js";
import MongoService from "./MongoService.js";
import Neo4jService from "./Neo4jService.js";
import GraphBook from "../Models/GraphBook.js";
class GraphService {
    logger;
    constructor() {
        this.logger = Config.getLoggerInstance();
    }
    retrieveAllIndex = async () => {
        this.logger.getLogger().info("Début de la mise à jour de la table d'index inversés.");
        // Connection à la base.
        const mongoService = new MongoService(Config.getInstance().getMongoDbUrl());
        await mongoService.OpenConnection();
        mongoService.SetCollection(Constants.MONGO_INDEX_COLLECTION);
        // Récuperer tous les index de la collection.
        this.logger.getLogger().info("Obtention des index.");
        const index = await mongoService.GetAllIndex();
        await mongoService.CloseConnection();
        return index;
    };
    CalculateCosineSimilarity = (v1, v2) => {
        let dotProduct = 0;
        let magnitude1 = 0;
        let magnitude2 = 0;
        for (let i = 0; i < v1.length; i++) {
            dotProduct += v1[i] * v2[i];
            magnitude1 += v1[i] * v1[i];
            magnitude2 += v2[i] * v2[i];
        }
        magnitude1 = Math.sqrt(magnitude1);
        magnitude2 = Math.sqrt(magnitude2);
        if (magnitude1 !== 0 && magnitude2 !== 0) {
            return dotProduct / (magnitude1 * magnitude2);
        }
        return 0;
    };
    CalculateSimilarityForAllBooks = (index) => {
        const dist_matrix = [];
        for (let i = 0; i < index.length; i++) {
            for (let j = i + 1; j < index.length; j++) {
                const v1 = {};
                const v2 = {};
                for (let keyword in index[i].tokens) {
                    v1[keyword] = index[i].tokens[keyword];
                    if (index[j].tokens[keyword]) {
                        v2[keyword] = index[j].tokens[keyword];
                    }
                    else {
                        v2[keyword] = 0;
                    }
                }
                for (let keyword in index[j].tokens) {
                    if (!index[i].tokens[keyword]) {
                        v1[keyword] = 0;
                        v2[keyword] = index[j].tokens[keyword];
                    }
                }
                const v1Array = Object.values(v1);
                const v2Array = Object.values(v2);
                const sim = this.CalculateCosineSimilarity(v1Array, v2Array);
                dist_matrix.push({ book1_id: index[i].id, book2_id: index[j].id, similarity: sim });
            }
        }
        return dist_matrix;
    };
    retrieveAllBooks = async () => {
        this.logger.getLogger().info("Début de la mise à jour de la table d'index inversés.");
        // Connection à la base.
        const mongoService = new MongoService(Config.getInstance().getMongoDbUrl());
        await mongoService.OpenConnection();
        mongoService.SetCollection(Constants.MONGO_BOOK_COLLECTION);
        // Récuperer tous les livres de la collection.
        this.logger.getLogger().info("Obtention des index.");
        const books = (await mongoService.GetAllBooks()).map((book) => ({
            id: book.id,
            title: book.title,
            subjects: book.subjects,
            authors: book.authors,
            ...book.formats
        }));
        await mongoService.CloseConnection();
        return books;
    };
    getBook = (id, books) => {
        for (let i = 0; i < books.length; i++) {
            if (books[i].id === id) {
                return books[i];
            }
        }
        return undefined;
    };
    insertBooksToNeo4j = async (books) => {
        const neo4jService = new Neo4jService();
        await neo4jService.Connect();
        const session = neo4jService.driver.session();
        await session.run("MATCH (n) DETACH DELETE n");
        this.logger.getLogger().info("Inserting Nodes...");
        let count = 0;
        for (let book of books) {
            const graphBook = new GraphBook(book.id, book.title, book.subjects, book.authors);
            try {
                await neo4jService.AddBookNode(graphBook);
                count++;
            }
            catch (e) {
                this.logger.getLogger().error("Failed to add book to neo4j: ", e);
            }
        }
        this.logger.getLogger().info("Inserted books to AuraDB ", count);
        session.close();
    };
    insertToNeo4j = async (dist_matrix, books) => {
        const neo4jService = new Neo4jService();
        await neo4jService.Connect();
        for (const element of dist_matrix) {
            const book1 = this.getBook(element.book1_id, books);
            const book2 = this.getBook(element.book2_id, books);
            if (!book1 || !book2) {
                continue;
            }
            if (element.similarity > 0) {
                try {
                    const graphBook = new GraphBook(book2.id, book2.title, book2.subjects, book2.authors);
                    await neo4jService.MakeGraph({ id: book1.id }, graphBook, "neighbours", element.similarity);
                }
                catch (e) {
                    this.logger.getLogger().error("Failed to add relation between books to neo4j: ", e);
                }
            }
        }
        neo4jService.driver.close();
    };
    printDistMatrix = (dist_matrix) => {
        dist_matrix.forEach((element) => {
            console.log("Book1_id: ", element.book1_id, "Book2_id: ", element.book2_id, "Similarity: ", element.similarity);
        });
    };
    printIndex = (index) => {
        index.forEach((element) => {
            console.log("Id: ", element.id, "Tokens: ", element.tokens);
        });
    };
    async main() {
        const index = await this.retrieveAllIndex();
        //this.printIndex(index);
        const dist_matrix = this.CalculateSimilarityForAllBooks(index);
        this.logger.getLogger().info("Dist_matrix: ", dist_matrix.length);
        const books = await this.retrieveAllBooks();
        await this.insertBooksToNeo4j(books);
        await this.insertToNeo4j(dist_matrix, books);
        this.printDistMatrix(dist_matrix);
    }
}
export default GraphService;
