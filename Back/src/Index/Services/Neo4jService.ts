import neo4j, { Driver } from 'neo4j-driver';
import Constants from '../Tools/Constants.js';

class Neo4jService {
    private URI = Constants.NEO4J_URL
    private USER = Constants.NEO4J_USER
    private PASSWORD = Constants.NEO4J_PASSWORD
    driver!: Driver;


    async connect() {
        try {
            this.driver = neo4j.driver(this.URI, neo4j.auth.basic(this.USER, this.PASSWORD))
            const serverInfo = await this.driver.getServerInfo()
            console.log('Connection established ', serverInfo)
        } catch(err) {
            console.log(`Connection error\n${err}\nCause: ${(err as Error).cause}`)
        }
    }

    
    async addBookNode(bookProperties: {id: string, title: string, subjects: string[], authors: string[]}) {
        const session = this.driver.session();
        try {
            const result = await session.run(
                `MERGE (b:Book {id: $bookId, title: $bookTitle, subjects: $bookSubjects, authors: $bookAuthors})
                RETURN b`,
                { 
                    bookId: bookProperties.id, 
                    bookTitle: bookProperties.title, 
                    bookSubjects: bookProperties.subjects, 
                    bookAuthors: bookProperties.authors 
                }
            );
            return result.records[0].get('b');
        } catch (error) {
            console.error(`Failed to add or retrieve book: ${error}`);
        } finally {
            session.close();
        }
    }


    async addRelationBetweenBooks(book1Properties: {id: string}, book2Properties: {id: string}, relationName: string, relationProperties: object = {}) {
        const session = this.driver.session();
        try {
            const result = await session.run(
                `MATCH (a:Book {id: $book1Id}), (b:Book {id: $book2Id})
                 MERGE (a)-[r:${relationName} $relationProperties]->(b)
                 RETURN r`,
                { 
                    book1Id: book1Properties.id, 
                    book2Id: book2Properties.id, 
                    relationProperties 
                }
            );
            return result.records;
        } catch (error) {
            console.error(`Failed to add relation between books: ${error}`);
        } finally {
            session.close();
        }
    }
}

export default Neo4jService;