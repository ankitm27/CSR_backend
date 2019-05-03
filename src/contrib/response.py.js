let responseCodes = Object.freeze({
    HTTP_200_OK: 200,
    HTTP_201_CREATED: 201,
    HTTP_202_ACCEPTED: 202,
    HTTP_204_NO_CONTENT: 204,
    HTTP_400_BAD_REQUEST: 400,
    HTTP_401_UNAUTHORIZED: 401,
    HTTP_403_FORBIDDEN: 403,
    HTTP_404_NOT_FOUND: 404,
    HTTP_500_INTERAL_SERVER_ERROR: 500
});

export default responseCodes;

let successResponses = [
    responseCodes.HTTP_200_OK,
    responseCodes.HTTP_201_CREATED,
    responseCodes.HTTP_202_ACCEPTED,
    responseCodes.HTTP_204_NO_CONTENT
];

let errorResponses = [
    responseCodes.HTTP_400_BAD_REQUEST,
    responseCodes.HTTP_401_UNAUTHORIZED,
    responseCodes.HTTP_403_FORBIDDEN,
    responseCodes.HTTP_404_NOT_FOUND
];

export function sendResponse(res, status, errorMessage = null, successData = {}) {
    if (Object.values(responseCodes) == -1) {
        return (Error('Invalid status'));
    } else {
        if (errorMessage == null && errorResponses.indexOf(status) != -1) {
            if (status == responseCodes.HTTP_400_BAD_REQUEST) {
                errorMessage = "Validation error occurred"
            } else if (status == responseCodes.HTTP_401_UNAUTHORIZED) {
                errorMessage = "Authentication required"
            } else if (status == responseCodes.HTTP_403_FORBIDDEN) {
                errorMessage = "Permission required"
            } else if (status == responseCodes.HTTP_404_NOT_FOUND) {
                errorMessage = "Not found"
            }
        }

        if (successResponses.indexOf(status) != -1) {
            res.status(status).send({success: true, data: successData});
        } else if (errorResponses.indexOf(status) != -1) {
            res.status(status).send({success: false, error: errorMessage});
        }
    }
}