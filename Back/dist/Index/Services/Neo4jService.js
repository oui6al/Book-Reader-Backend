import neo4j from 'neo4j-driver';
import Constants from '../Tools/Constants.js';
class Neo4jService {
    URI = Constants.NEO4J_URL;
    USER = Constants.NEO4J_USER;
    PASSWORD = Constants.NEO4J_PASSWORD;
    driver;
    async Connect() {
        try {
            this.driver = neo4j.driver(this.URI, neo4j.auth.basic(this.USER, this.PASSWORD));
            const serverInfo = await this.driver.getServerInfo();
            console.log('Connection established ', serverInfo);
        }
        catch (err) {
            console.log(`Connection error\n${err}\nCause: ${err.cause}`);
        }
    }
    async GetEdges() {
        const session = this.driver.session();
        try {
            // Exécutez la requête Cypher pour récupérer les voisins
            const result = await session.run(`
            MATCH (n1:Book)-[r:neighbours]->(n2:Book)
            RETURN r.similarity AS poidsRelation, n1.id AS noeud1, n2.id AS noeud2
          `);
            // Convertissez les résultats de la requête en une liste de voisins
            const neighbours = result.records.map(record => ([record.get('poidsRelation'),
                record.get('noeud1'),
                record.get('noeud2')]));
            return neighbours;
        }
        catch (error) {
            throw new Error("Impossible d'obtenir le graphe depuis neo4j." + error);
        }
        finally {
            await session.close();
        }
    }
    AddBookNode = async (bookProperties) => {
        const session = this.driver.session();
        try {
            const result = await session.run(`MERGE (a:Book {id: $id, title: $title, subjects: $subjects, authors: $authors}) RETURN a`, { id: bookProperties.id, title: bookProperties.title, subjects: bookProperties.subjects, authors: bookProperties.author });
            return result.records;
        }
        catch (error) {
            console.error(`Failed to add book to neo4j: ${error}`);
        }
        finally {
            session.close();
        }
    };
    async MakeGraph(book1Properties, book2Properties, relationName, similarity) {
        const session = this.driver.session();
        try {
            const result = await session.run(`MERGE (b:Book {id: $book2Id, title: $book2Title, subjects: $book2Subjects, authors: $book2Authors})
                 WITH b
                 MATCH (a:Book {id: $book1Id})
                 WITH a, b
                 MERGE (a)-[r:${relationName} {similarity: $similarity}]->(b)
                 RETURN r`, {
                book1Id: book1Properties.id,
                book2Id: book2Properties.id,
                book2Title: book2Properties.title,
                book2Subjects: book2Properties.subjects,
                book2Authors: book2Properties.author,
                similarity: similarity
            });
            return result.records;
        }
        catch (error) {
            console.error(`Failed to add relation between books: ${error}`);
        }
        finally {
            session.close();
        }
    }
}
export default Neo4jService;
