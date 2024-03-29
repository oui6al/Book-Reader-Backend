import betweennessCentrality from "graphology-metrics/centrality/betweenness.js";
import closenessCentrality from 'graphology-metrics/centrality/closeness.js';
import Neo4jService from "../Index/Services/Neo4jService.js";
import Config from "../Index/Tools/Config.js"
import Logger from "../Index/Tools/Logger.js"
import Graph from 'graphology';
import Book from "../Index/Models/Book.js";
import MongoService from "../Index/Services/MongoService.js";
import Constants from "../Index/Tools/Constants.js";

class GraphSearchService {
  logger: Logger;
  neo4jService: Neo4jService
  graph: Graph | null = null;
  relations: Array<[number, string, string]> | null = null;

  constructor() {
    this.logger = Config.getLoggerInstance();
    this.neo4jService = new Neo4jService();
  }

  async CreateGraph() {
    await this.neo4jService.Connect();
    try {
      this.relations = await this.neo4jService.GetEdges();
      const graph = new Graph();
      this.relations.forEach(([weight, bookId1, bookId2]) => {
        if (!graph.hasNode(bookId1)) {
          graph.addNode(bookId1);
        }
        if (!graph.hasNode(bookId2)) {
          graph.addNode(bookId2);
        }
        graph.addEdge(bookId1, bookId2, { weight });
      });
      this.graph = graph;
    }
    catch (error: any) {
      throw new Error("Impossible de créer le graphe.", error);
    }
  }

  async StoreCentralityScores() {
    try {
      if (this.graph) {
        const betweenness = betweennessCentrality(this.graph);
        const closeness = closenessCentrality(this.graph);

        const betweennessArray = Object.entries(betweenness);
        const closenessArray = Object.entries(closeness);

        for (const [bookId, score] of betweennessArray) {
          await this.neo4jService.storeBetweennessScore(parseInt(bookId), score);
        }

        for (const [bookId, score] of closenessArray) {
          await this.neo4jService.storeClosenessScore(parseInt(bookId), score);
        }
      }
    } catch (error: any) {
      throw new Error("Impossible de stocker les scores de centralité.", error);
    }
  }

  async GetBetweennessValues(bookIds: Array<number>): Promise<[bookId: string,score: number][]> {
    let centralityArray : number[][] = [];
    try {
      if (this.graph) {
        let betweenness = []
        for(let i = 0;i<bookIds.length;i++){
          betweenness[i] = [bookIds[i],await this.neo4jService.getBetweennessScore(bookIds[i])];
        }
        centralityArray = betweenness.sort((a, b) => b[0] - a[0]);
       } 
    } catch (error: any) {
      throw new Error("Impossible de récupérer le betweeness des noeuds.", error);
    }
    let resultat: [bookId: string,score: number][] = []
    centralityArray.forEach(([bookId, score]) => resultat.push([bookId.toString(), score]));
    return resultat;
  }

  async GetClosenessValues(bookIds: Array<number>): Promise<[bookId: string,score: number][]> {
    let centralityArray : number[][] = [];
    try {
      if (this.graph) {
        let closeness = []
        for(let i = 0;i<bookIds.length;i++){
          closeness[i] = [bookIds[i],await this.neo4jService.getClosenessScore(bookIds[i])];
        }
        centralityArray = closeness.sort((a, b) => b[0] - a[0]);
       } 
    } catch (error: any) {
      throw new Error("Impossible de récupérer le closeness des noeuds.", error);
    }
    let resultat: [bookId: string,score: number][] = []
    centralityArray.forEach(([bookId, score]) => resultat.push([bookId.toString(), score]));
    return resultat;
 }
 
  async GetSuggestion(booksId: Array<number>): Promise<Array<Book>>{
    try {
      // Connection à la base.
      const mongoService = new MongoService(Config.getInstance().getMongoDbUrl());
      await mongoService.OpenConnection();
      mongoService.SetCollection(Constants.MONGO_BOOK_COLLECTION);
      const result: Array<Book> = [];
      if (this.relations) {

        // Conserve uniquement les relations qui incluent un livre de la liste historique et conserve le livre qui est lié.
        const filteredRelations: [number,  number][] = this.relations
          .filter(([poids, nodeId1, nodeId2]) => {
            const node1InList = booksId.includes(parseInt(nodeId1));
            const node2InList = booksId.includes(parseInt(nodeId2));

            return (node1InList || node2InList) && !(node1InList && node2InList);
          })
          .map(([poids, nodeId1, nodeId2]) => {
            return booksId.includes(parseInt(nodeId1)) ? [poids, parseInt(nodeId2)] : [poids, parseInt(nodeId1)];
          });

        // Tri la liste par poids.
        const sortedRelations = filteredRelations.sort((a, b) => b[0] - a[0]);

        // Déduplique les mêmes id de livre pour conserver le meilleur score.
        let idAlreadySeens = new Set();
        let deduplicateRelations = sortedRelations.filter(book => {
            if (!idAlreadySeens.has(book[1])) {
              idAlreadySeens.add(book[1]);
              return true;
            }
            return false;
          });

        let slicedRelations = deduplicateRelations.slice(0, 10);

        // Obtention des livres.
        const booksPromises = slicedRelations.map(async ([poids, nodeId]: [number, number]) => {
          return await mongoService.getBook(nodeId);
        });
  
        // Attendre que toutes les promesses soient résolues avant de retourner le résultat.
        return await Promise.all(booksPromises);
      }
      else {
        throw new Error("La liste des relations doit être définie avant de trouver les suggestion.");
      }
    }
    catch (error: any) 
    {
      throw new Error("Impossible d'obtenir les suggestions." + error);
    }
  }
}

export default GraphSearchService;