import BookService from "./Services/BookService.js";
import GraphService from "./Services/GraphService.js";
import IndexService from "./Services/IndexService.js";
import Config from "./Tools/Config.js";
class App {
    config;
    logger;
    bookService;
    indexService;
    graphService;
    constructor() {
        this.config = Config.getInstance();
        this.logger = Config.getLoggerInstance();
        this.bookService = new BookService();
        this.indexService = new IndexService();
        this.graphService = new GraphService();
    }
    async main() {
        this.logger.getLogger().info("Paramètres d'execution chargés via le fichier Config.json :");
        this.logger.getLogger().info("Chemin des logs : ", Config.getInstance().getLogPath());
        this.logger.getLogger().info("Nombre de livres maximum : ", Config.getInstance().getMaxBook());
        this.logger.getLogger().info("Url de la base mongoDb : ", Config.getInstance().getMongoDbUrl());
        if (!Config.getInstance().getRunBool()) {
            this.logger.getLogger().info("Le paramètre d'execution est renseigné à faux, le batch ne s'éxecutera pas.");
            return;
        }
        this.logger.getLogger().info("Début de l'éxecution du batch de mise à jour des index.");
        await this.bookService.main();
        await this.indexService.main();
        this.logger.getLogger().info("Fin de l'éxecution du batch de mise à jour des index.");
        this.logger.getLogger().info("Début de Création du graphe Neo4j.");
        await this.graphService.main();
        this.logger.getLogger().info("Fin de Création du graphe Neo4j.");
    }
}
const execute = new App();
await execute.main();
export default App;
