import Index from "../Models/Index.js";
import Config from "../Tools/Config.js";
import Constants from "../Tools/Constants.js";
import Logger from "../Tools/Logger.js";
import MongoService from "./MongoService.js";
import Neo4jService from "./Neo4jService.js";
import Book from "../Models/Book.js";



class GraphService {
    private logger: Logger; 
    
    constructor() { 
        this.logger = Config.getLoggerInstance();
    }

    retrieveAllIndex = async (): Promise<Array<Index>> => {
        this.logger.getLogger().info("Début de la mise à jour de la table d'index inversés.");
        // Connection à la base.
        const mongoService = new MongoService(Config.getInstance().getMongoDbUrl());
        await mongoService.OpenConnection();
        mongoService.SetCollection(Constants.MONGO_INDEX_COLLECTION);

        // Récuperer tous les index de la collection.
        this.logger.getLogger().info("Obtention des index.");
        const index: Array<Index> = await mongoService.GetAllIndex();
        await mongoService.CloseConnection();

        return index; 
    }

    CalculateCosineSimilarity = (v1: Array<number>, v2: Array<number>): number => {
        let dotProduct = 0;
        let magnitude1 = 0;
        let magnitude2 = 0;
        for (let i = 0; i < v1.length; i++) {
            dotProduct += v1[i] * v2[i];
            magnitude1 += v1[i] * v1[i];
            magnitude2 += v2[i] * v2[i];
            if(isNaN(dotProduct)) console.log("dotProduct is NaN",v1[i], v2[i]);
            if(isNaN(magnitude1)) console.log("magnitude1 is NaN",v1[i], v2[i]);
            if(isNaN(magnitude2)) console.log("magnitude2 is NaN",v1[i], v2[i]);

        }
        magnitude1 = Math.sqrt(magnitude1);
        magnitude2 = Math.sqrt(magnitude2);
        if (magnitude1 !== 0 && magnitude2 !== 0) {
            return dotProduct / (magnitude1 * magnitude2);
        }
        return 0;
    }

    CalculateSimilarityForAllBooks = (index: Array<Index>): { book1_id: number, book2_id: number, similarity: number}[] => {
        const dist_matrix: { book1_id: number, book2_id: number, similarity: number}[] = [];
        
        for (let i = 0; i < index.length; i++) {
            for (let j = i + 1; j < index.length; j++) {
                const v1: {[key: string]: number}  =  {};
                const v2: {[key: string]: number}  =  {};

                for (let keyword in index[i].tokens) {
                    v1[keyword] = index[i].tokens[keyword];
                    if (index[j].tokens[keyword]) {
                        v2[keyword] = index[j].tokens[keyword];
                    } else {
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
    }

    retrieveAllBooks = async (): Promise<Array<Book>> => {
        this.logger.getLogger().info("Début de la mise à jour de la table d'index inversés.");
        // Connection à la base.
        const mongoService = new MongoService(Config.getInstance().getMongoDbUrl());
        await mongoService.OpenConnection();
        mongoService.SetCollection(Constants.MONGO_BOOK_COLLECTION);

        // Récuperer tous les livres de la collection.
        this.logger.getLogger().info("Obtention des index.");
        const books: Array<Book> = (await mongoService.GetAllBooks()).map((book) => ({
            id: book.id,
            title: book.title,
            subjects: book.subjects,
            authors: book.authors,
            ...book.formats
        }));
        await mongoService.CloseConnection();
        return books;
    }

    getBook = (id: number, books: Array<Book>): Book | undefined => {
        for (let i = 0; i < books.length; i++) {
            if (books[i].id === id) {
                return books[i]
            }
        }
        return undefined;
    }
 
    insertToNeo4j = async (dist_matrix: { book1_id: number, book2_id: number, similarity: number}[], books: Array<Book>): Promise<void> => {
        const neo4jService = new Neo4jService();
        await neo4jService.connect();

        const session = neo4jService.driver.session();
        await session.run("MATCH (n) DETACH DELETE n");
        let compteur = 0;
        for (const element of dist_matrix) {
            const book1 = this.getBook(element.book1_id, books);
            const book2 = this.getBook(element.book2_id, books);
            if (!book1 || !book2) {
                continue;
            }
            try {
                compteur++;
                await neo4jService.addBookNode({
                    id: book1.id,
                    title: book1.title,
                    subjects: book1.subjects,
                    authors: book1.authors
                });
                console.log(compteur, " ) Book1: ", book1.id)
            } catch (e) {
                this.logger.getLogger().error("Failed to add book to neo4j: ", e);
            }
            if (element.similarity > 0) { 
                try {
                    await neo4jService.makeGraph({id: book1.id},  {id: book2.id,title: book2.title, subjects: book2.subjects, authors: book2.authors} ,"neighbours", element.similarity);
                } catch (e) {
                    this.logger.getLogger().error("Failed to add relation between books to neo4j: ", e);
                }
            }
        }
        session.close();

        neo4jService.driver.close();
    }
    

    printDistMatrix = (dist_matrix: { book1_id: number, book2_id: number, similarity: number}[]) => {
        dist_matrix.forEach((element) => {
            console.log("Book1_id: ", element.book1_id, "Book2_id: ", element.book2_id, "Similarity: ", element.similarity);
        });
    }

    printIndex = (index: Array<Index>) => {
        index.forEach((element) => {
            console.log("Id: ", element.id, "Tokens: ", element.tokens);
        });
    
    }


    async main() {
        const index = await this.retrieveAllIndex();
        //this.printIndex(index);
        const dist_matrix = this.CalculateSimilarityForAllBooks(index);
        const books = await this.retrieveAllBooks();
        this.logger.getLogger().info("Début de Création du graphe Neo4j.");
        this.insertToNeo4j(dist_matrix, books);
        this.logger.getLogger().info("Fin de Création du graphe Neo4j.");
        this.printDistMatrix(dist_matrix);
    }


}

export default GraphService;