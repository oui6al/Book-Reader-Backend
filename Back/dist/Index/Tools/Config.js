import * as fs from 'fs';
import * as path from 'path';
import Logger from './Logger.js';
import Constants from './Constants.js';
import urljoin from 'url-join';
class Config {
    static instance;
    config;
    static loggerInstance;
    constructor() {
        const workingDirectory = path.resolve();
        const configPath = path.resolve(workingDirectory, "src/Index", Constants.CONFIG_FILENAME);
        const configData = fs.readFileSync(configPath, 'utf-8');
        this.config = JSON.parse(configData);
        this.config.mongoDbUrl = urljoin(this.config.mongoDbUrl, Constants.MONGO_DBNAME);
        Config.loggerInstance = new Logger(this.config.logPath);
    }
    static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }
    static getLoggerInstance() {
        return Config.loggerInstance;
    }
    getLogPath() {
        return this.config.logPath;
    }
    getMaxBook() {
        return this.config.maxBook;
    }
    getMongoDbUrl() {
        return this.config.mongoDbUrl;
    }
    getRunBool() {
        return this.config.run;
    }
    getGutendexUrl() {
        return this.config.gutendexUrl;
    }
}
export default Config;
