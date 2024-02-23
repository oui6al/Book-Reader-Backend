import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
class Logger {
    logger;
    constructor(logPath) {
        const infoTransport = new DailyRotateFile({
            filename: path.resolve(logPath, "%DATE%", "app-info.log"),
            datePattern: 'YYYY-MM-DD',
            level: 'info',
        });
        const debugTransport = new DailyRotateFile({
            filename: path.resolve(logPath, "%DATE%", "app-debug.log"),
            datePattern: 'YYYY-MM-DD',
            level: 'debug',
        });
        const errorTransport = new DailyRotateFile({
            filename: path.resolve(logPath, "%DATE%", "app-error.log"),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
        });
        // Initialise le logger avec le chemin du log spécifié dans la configuration
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm' }), winston.format.simple()),
            transports: [
                new winston.transports.Console({ level: 'silly' }),
                infoTransport,
                debugTransport,
                errorTransport,
            ],
        });
    }
    getLogger() {
        return this.logger;
    }
}
export default Logger;
