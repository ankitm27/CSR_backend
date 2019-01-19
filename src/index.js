import * as path from "path";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import setUp from "./bin/db";
import userRouter from "./users/route";
import {port as PORT} from "./settings/config";

setUp();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(helmet());

app.use('/static', express.static(path.join(__dirname, '/../node_modules')));
app.use('/app', express.static(path.join(__dirname, '/../app')));
app.use('/media', express.static(path.join(__dirname, '/../media')));
app.use('/public', express.static(path.join(__dirname, '/../public')));

app.use('/api', userRouter);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/../app/views/index.html'));
});

app.listen(PORT, () => {
    console.log('Port is listening at ' + PORT);
});