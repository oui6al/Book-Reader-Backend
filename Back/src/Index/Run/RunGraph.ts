import GraphService from "../Services/GraphService.js";
import Config from "../Tools/Config.js";
import Logger from "../Tools/Logger.js";

class RunGraph {
  private config: Config;
  private logger: Logger;
  private graphService: GraphService;

  constructor() {
    this.config = Config.getInstance();
    this.logger = Config.getLoggerInstance();
    this.graphService = new GraphService();
  }

  async main(){
    this.logger.getLogger().info("Paramètres d'execution chargés via le fichier Config.json :");

    this.logger.getLogger().info("Chemin des logs : ", Config.getInstance().getLogPath());
    this.logger.getLogger().info("Nombre de livres maximum : ", Config.getInstance().getMaxBook());
    this.logger.getLogger().info("Url de la base mongoDb : ", Config.getInstance().getMongoDbUrl());

    if(!Config.getInstance().getRunBool())
    {
      this.logger.getLogger().info("Le paramètre d'execution est renseigné à faux, le batch ne s'éxecutera pas.");
      return;
    }

    this.logger.getLogger().info("Début de l'éxecution du batch de mise à jour du graphe.");
    await this.graphService.main();
    this.logger.getLogger().info("Fin de l'éxecution du batch de mise à jour du graphe.");

  }
}

const execute : RunGraph = new RunGraph();
await execute.main();

export default RunGraph;
