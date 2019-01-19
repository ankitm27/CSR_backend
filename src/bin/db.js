// import asyncRedis from "async-redis";
import mongoose from "mongoose";
import util from "util";

import {cache, db} from "../settings/config";


export default function setUp() {
    // let client = asyncRedis.createClient(cache.PORT, cache.HOST);
    let dbUrl = util.format("mongodb://%s:%s/%s", db.HOST, db.PORT, db.NAME);

    mongoose.Promise = global.Promise;
    mongoose.connect(dbUrl, {useNewUrlParser: true, useCreateIndex: true})
        .then(db => {
            console.log("Connected to mongoose");
        }, error => {
            console.log(error);
        });

    // client.on('connect', () => {
    //     console.log('Connected to redis');
    // });

    // global.client = client;
}
