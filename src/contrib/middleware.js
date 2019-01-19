import jwt from 'jsonwebtoken';
import {jwtSecret} from "../settings/config";
import {UserModel} from "../users/model";

export class TokenAuthenticationMiddleware {
    checkToken (req, res, next) {
        let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }

        if (token) {
            jwt.verify(token, jwtSecret, (err, decoded) => {
                if (err) {
                    return res.json({
                        status_code: 401,
                        success: false,
                        message: 'Token is not valid'
                    });
                } else {
                    // TODO get user async
                    req.user = UserModel.findOne({"email": decoded.email});
                    next();
                }
            });
        } else {
            return res.json({
                status_code: 401,
                success: false,
                message: 'Auth token is not supplied'
            });
        }
    }
}