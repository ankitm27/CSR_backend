import jwt from 'jsonwebtoken';
import {jwtSecret} from "../settings/config";
import {User} from "../users/model";
import responseCodes, {sendResponse} from "./response.py";
import {isEmpty} from "../utils/helpers";


export class TokenAuthenticationMiddleware {
    async checkToken(req, res, next) {
        try {
            let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
            if (token.startsWith('Bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }
            if (token) {
                let decoded = {};
                try {
                    decoded = await jwt.verify(token, jwtSecret);
                } catch (e) {
                    await sendResponse(res, responseCodes.HTTP_401_UNAUTHORIZED, "Token expired", null);
                }
                if (!isEmpty(decoded)) {
                    let user = await User.findOne({"email": decoded.email});
                    if (user == null) {
                        await sendResponse(res, responseCodes.HTTP_401_UNAUTHORIZED, "Invalid token", null);
                    }else if (!user.allowLoggedIn && req.originalUrl != "/api/volunteer/reset-password/") {
                        sendResponse(res, responseCodes.HTTP_400_BAD_REQUEST, "Password reset is required");
                    }else {
                        req.user = user;
                        next();
                    }
                }
            } else {
                await sendResponse(res, responseCodes.HTTP_401_UNAUTHORIZED);
            }
        }catch(e){
            console.log(e);
        }
    }
}