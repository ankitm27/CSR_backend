import jwt from 'jsonwebtoken';
import {jwtSecret} from "../settings/config";
import {User} from "../users/model";

export class TokenAuthenticationMiddleware {
    async checkToken (req, res, next) {
        let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }

        if (token) {
            let decoded = await jwt.verify(token, jwtSecret);
            let user = await User.findOne({"email": decoded.email});
            if (user == null) {
                return res.json({
                    status_code: 401,
                    success: false,
                    message: 'Invalid token is supplied'
                });
            }else {
                req.user = user;
                next();
            }
        } else {
            return res.json({
                status_code: 401,
                success: false,
                message: 'Auth token is not supplied'
            });
        }
    }
}