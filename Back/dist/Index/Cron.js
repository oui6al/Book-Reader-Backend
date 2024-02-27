// Cron.ts
import cron from 'node-cron';
import App from './App.js';
class Cron {
    static CRON_SCHEDULE = '48 14 * * *'; // Chaque jour à 12h10.
    constructor() {
        this.startCronJob();
    }
    async startCronJob() {
        cron.schedule(Cron.CRON_SCHEDULE, () => {
            this.runDailyTask();
        });
    }
    async runDailyTask() {
        const app = new App();
        await app.main();
    }
}
const createCron = new Cron();
