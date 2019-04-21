import jwt from 'jsonwebtoken';
import {jwtSecret} from "../settings/config";
import {UserRepository} from "./repository";
import {makeHash, compareHash} from "../utils/helpers";
import util from "util";
import {User, Program} from "./model";
import {ProgramRepository} from "./repository";


export class UserController {
    constructor() {
        this.userRepository = new UserRepository();
        // this.converterService = new UserService();
    }

    async login(req, res, next) {
        let data = req.body;
        let user = await User.findOne({"email": data.email});
        if(user == null) {
            res.send({
                "status_code": 400,
                "error": "Email not found"
            })
        }else {
            if (compareHash(data.password, user.password) == false) {
                res.send({
                    "status_code": 400,
                    "error": "Invalid password"
                })
            }else {
                let token = await jwt.sign({"email": user.email}, jwtSecret, { expiresIn: '24h'});
                res.send({
                    "status_code": 200,
                    "token": token
                });
            }
        }
        res.send();
    }

    async register(req, res, next) {
        // console.log(await this.userRepository.createUser(req.body));
        let data = req.body;
        data.password = makeHash(data.password);
        if(await User.findOne({'email': data.email}) != null) {
            res.send({
                "status_code": 400,
                "error": "User already exists with this email"
            })
        }else if(await User.findOne({'mobile': data.mobile}) != null) {
            res.send({
                "status_code": 400,
                "error": "User already exists with this mobile"
            })
        }else {
            let user = await User.create(data);
            res.send(user);
        }
    }
}


export class ProgramController {
    constructor() {
        this.programRepository = new ProgramRepository();
    }

    async getListP(req, res, next){
        let data = await Program.find({});
        res.send(data);
    }

    async getDetail(req, res, next){
        let uid = req.params.uid;
        res.send(await this.programRepository.get_object_or_404(res, uid));
    }

    async create(req, res, next){
        let data = req.body;
        data.user = req.user._id;
        res.send(await Program.create(data));
    }

    async update(req, res, next){
        let data = req.body;
        let uid = req.params.uid;
        let program = await this.programRepository.get_object_or_404(res, uid);
        for (let field in data ) {
            program[field] = data[field];
        }
        res.send(await program.save());
    }

    async delete(req, res, next){
        let uid = req.params.uid;
        await this.programRepository.delete_object_or_404(res, uid);
        res.send(204);
    }
}
