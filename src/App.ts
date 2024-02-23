import BookService from "./Services/BookService.js";
import IndexService from "./Services/IndexService.js";
import Config from "./Tools/Config.js";
import Logger from "./Tools/Logger.js";

class App {
  private config: Config;
  private logger: Logger;
  private bookService: BookService;
  private indexService: IndexService;

  constructor() {
    this.config = Config.getInstance();
    this.logger = Config.getLoggerInstance();
    this.bookService = new BookService();
    this.indexService = new IndexService();
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

    this.logger.getLogger().info("Début de l'éxecution du batch de mise à jour des index.");

    await this.bookService.main();
    await this.indexService.main();

    this.logger.getLogger().info("Fin de l'éxecution du batch de mise à jour des index.");
  }
}

const execute : App = new App();
await execute.main();

export default App;
