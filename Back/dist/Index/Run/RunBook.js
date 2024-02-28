import BookService from "../Services/BookService.js";
import Config from "../Tools/Config.js";
class RunBook {
    config;
    logger;
    bookService;
    constructor() {
        this.config = Config.getInstance();
        this.logger = Config.getLoggerInstance();
        this.bookService = new BookService();
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
        this.logger.getLogger().info("Début de l'éxecution du batch de mise à jour des livres.");
        await this.bookService.main();
        this.logger.getLogger().info("Fin de l'éxecution du batch de mise à jour des livres.");
    }
}
const execute = new RunBook();
await execute.main();
export default RunBook;
