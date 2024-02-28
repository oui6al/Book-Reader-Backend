import betweennessCentrality from "graphology-metrics/centrality/betweenness.js";
import closenessCentrality from 'graphology-metrics/centrality/closeness.js';
import Neo4jService from "../Index/Services/Neo4jService.js";
import Config from "../Index/Tools/Config.js";
import Graph from 'graphology';
class GraphSearchService {
    logger;
    neo4jService;
    graph = null;
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
        catch (error) {
            throw new Error("Impossible de créer le graphe.", error);
        }
    }
    async GetBetweenessValues() {
        try {
            if (this.graph) {
                const betweenness = betweennessCentrality(this.graph);
                const centralityArray = Object.entries(betweenness);
                return centralityArray.sort((a, b) => b[1] - a[1]);
            }
            return [];
        }
        catch (error) {
            throw new Error("Impossible de récupérer le betweeness des noeuds.", error);
        }
    }
    async GetClosenessValues() {
        try {
            if (this.graph) {
                const closeness = closenessCentrality(this.graph);
                const centralityArray = Object.entries(closeness);
                return centralityArray.sort((a, b) => b[1] - a[1]);
            }
            return [];
        }
        catch (error) {
            throw new Error("Impossible de récupérer le closeness des noeuds.", error);
        }
    }
}
const config = Config.getInstance();
const execute = new GraphSearchService();
await execute.CreateGraph();
await execute.GetBetweenessValues();
await execute.GetClosenessValues();
let a = 2;
