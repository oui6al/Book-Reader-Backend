import * as fs from 'fs';
import * as path from 'path';
import Logger from './Logger.js';
import Constants from './Constants.js';
import urljoin from 'url-join';

interface AppConfig {
  logPath: string;
  maxBook: number;
  mongoDbUrl: string;
  run: boolean;
}

class Config {
  private static instance: Config;
  private config: AppConfig;
  private static loggerInstance: Logger;

  private constructor() {
    const workingDirectory: string = path.resolve();
    const configPath = path.resolve(workingDirectory, "dist", Constants.CONFIG_FILENAME);
    const configData = fs.readFileSync(configPath, 'utf-8');
    this.config = JSON.parse(configData);
    this.config.mongoDbUrl = urljoin(this.config.mongoDbUrl, Constants.MONGO_DBNAME);
    Config.loggerInstance = new Logger(this.config.logPath);
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public static getLoggerInstance(): Logger {
    return Config.loggerInstance;
  }

  public getLogPath(): string {
    return this.config.logPath;
  }

  public getMaxBook(): number {
    return this.config.maxBook;
  }

  public getMongoDbUrl(): string {
    return this.config.mongoDbUrl;
  }

  public getRunBool(): boolean {
    return this.config.run;
  }
}

export default Config;