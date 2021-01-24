
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

export interface ILocation {
    title: string,
    x: number,
    y: number
}

class App {

    public app: express.Application;

    public constructor() {
        this.app = express();
        this.config();
    }

    private config() {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use((_, res: express.Response, next: express.NextFunction) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header(
                "Access-Control-Allow-Methods",
                "GET, POST, PUT, DELETE, OPTIONS"
            );
            res.header(
                "Access-Control-Allow-Headers",
                "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials"
            );
            res.header("Access-Control-Allow-Credentials", "true");
            next();
        });

        this.app.get('/', (_, res) =>{
            res.send('ok');
        })
    }
}

export default new App().app;