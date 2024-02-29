import neo4j, { Driver } from 'neo4j-driver';
import Constants from '../Tools/Constants.js';
import GraphBook from '../Models/GraphBook.js';

class Neo4jService {
    private URI = Constants.NEO4J_URL
    private USER = Constants.NEO4J_USER
    private PASSWORD = Constants.NEO4J_PASSWORD
    driver!: Driver;


    async Connect() {
        try {
            this.driver = neo4j.driver(this.URI, neo4j.auth.basic(this.USER, this.PASSWORD))
            const serverInfo = await this.driver.getServerInfo()
            console.log('Connection established ', serverInfo)
        } catch (err) {
            console.log(`Connection error\n${err}\nCause: ${(err as Error).cause}`)
        }
    }

    async GetEdges(): Promise<Array<[number, string, string]>>
    {
        const session = this.driver.session();
        try {
          // Exécutez la requête Cypher pour récupérer les voisins
          const result = await session.run(`
            MATCH (n1:Book)-[r:neighbours]->(n2:Book)
            RETURN r.similarity AS poidsRelation, n1.id AS noeud1, n2.id AS noeud2
          `);
      
          // Convertissez les résultats de la requête en une liste de voisins
          const neighbours : Array<[number, string, string]> = result.records.map(record => (
            [record.get('poidsRelation'),
             record.get('noeud1'),
             record.get('noeud2')]
          ));          
          return neighbours;
        } 
        catch (error: any)
        {
            throw new Error("Impossible d'obtenir le graphe depuis neo4j." + error);
        }
        finally 
        {
          await session.close();
        }
      }

    AddBookNode = async (bookProperties: GraphBook) => {
        const session = this.driver.session();
        try {
            const result = await session.run(
                `MERGE (a:Book {id: $id, title: $title, subjects: $subjects, authors: $authors}) RETURN a`,
                { id: bookProperties.id, title: bookProperties.title, subjects: bookProperties.subjects, authors: bookProperties.author }
            );
            return result.records;
        } catch (error) {
            console.error(`Failed to add book to neo4j: ${error}`);
        } finally {
            session.close();
        }
    }


    async MakeGraph(book1Properties: { id: string }, book2Properties: GraphBook, relationName: string, similarity: number) {
        const session = this.driver.session();
        try {
            const result = await session.run(
                `MERGE (b:Book {id: $book2Id, title: $book2Title, subjects: $book2Subjects, authors: $book2Authors})
                 WITH b
                 MATCH (a:Book {id: $book1Id})
                 WITH a, b
                 MERGE (a)-[r:${relationName} {similarity: $similarity}]->(b)
                 RETURN r`,
                {
                    book1Id: book1Properties.id,
                    book2Id: book2Properties.id,
                    book2Title: book2Properties.title,
                    book2Subjects: book2Properties.subjects,
                    book2Authors: book2Properties.author,
                    similarity: similarity
                }
            );
            return result.records;
        } catch (error) {
            console.error(`Failed to add relation between books: ${error}`);
        } finally {
            session.close();
        }
    }

    async storeBetweennessScore(bookId: number, score: number) {
        const session = this.driver.session();
        try {
            const result = await session.run(
                `MATCH (b:Book {id: $bookId})
                 SET b.betweenness = $score
                 RETURN b`,
                { bookId: bookId, score: score }
            );
            return result.records;
        } catch (error) {
            console.error(`Failed to store betweenness score: ${error}`);
        } finally {
            session.close();
        }
    }

    async storeClosenessScore(bookId: number, score: number) {
        const session = this.driver.session();
        try {
            const result = await session.run(
                `MATCH (b:Book {id: $bookId})
                 SET b.closeness = $score
                 RETURN b`,
                { bookId: bookId, score: score }
            );
            return result.records;
        } catch (error) {
            console.error(`Failed to store closeness score: ${error}`);
        } finally {
            session.close();
        }
    }

    async getBetweennessScore(bookId: number): Promise<number> {
        const session = this.driver.session();
        let score = 0;
        try {
            const result = await session.run(
                `MATCH (b:Book {id: $bookId})
                 RETURN b.betweenness AS betweenness`,
                { bookId: bookId }
            );
            score = result.records.map(record => record.get('betweenness')).pop() as number;
        } catch (error) {
            console.error(`Failed to get betweenness score: ${error}`);
        } finally {
            session.close();
        }
        return score;
    }

    async getClosenessScore(bookId: number): Promise<number> {
        const session = this.driver.session();
        let score = 0;
        try {
            const result = await session.run(
                `MATCH (b:Book {id: $bookId})
                 RETURN b.closeness AS closeness`,
                { bookId: bookId }
            );
            score = result.records.map(record => record.get('closeness')).pop() as number;
        } catch (error) {
            console.error(`Failed to get closeness score: ${error}`);
        } finally {
            session.close();
        }
        return score;
    }
}

export default Neo4jService;