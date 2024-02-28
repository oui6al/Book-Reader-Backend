import IndexService from "../Services/IndexService.js";
import Config from "../Tools/Config.js";
class RunReverseIndex {
    config;
    logger;
    indexService;
    constructor() {
        this.config = Config.getInstance();
        this.logger = Config.getLoggerInstance();
        this.indexService = new IndexService();
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
        this.logger.getLogger().info("Début de l'éxecution du batch de mise à jour des index inversés.");
        await this.indexService.UpdateIndexReversed();
        this.logger.getLogger().info("Fin de l'éxecution du batch de mise à jour des index inversés.");
    }
}
const execute = new RunReverseIndex();
await execute.main();
export default RunReverseIndex;