import betweennessCentrality from "graphology-metrics/centrality/betweenness.js";
import closenessCentrality from 'graphology-metrics/centrality/closeness.js';
import Neo4jService from "../Index/Services/Neo4jService.js";
import Config from "../Index/Tools/Config.js"
import Logger from "../Index/Tools/Logger.js"
import Graph from 'graphology';

class GraphSearchService {
  logger: Logger;
  neo4jService: Neo4jService
  graph: Graph | null = null;

  constructor() {
    this.logger = Config.getLoggerInstance();
    this.neo4jService = new Neo4jService();
  }

  async CreateGraph() {
    await this.neo4jService.Connect();
    try {
      const relations = await this.neo4jService.GetEdges();
      const graph = new Graph();
      relations.forEach(([weight, bookId1, bookId2]) => {
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
 

}

export default GraphSearchService;
