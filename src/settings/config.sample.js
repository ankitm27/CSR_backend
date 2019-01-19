// module.exports.cache = Object.freeze({
//     HOST: "127.0.0.1",
//     PORT: 6379
// });


module.exports.db = {
    HOST: "127.0.0.1",
    PORT: 27017,
    NAME: "wpf_csr"
};

module.exports.jwtSecret = Object.freeze('04c09d7c2a4941d4973b6706b417cc65');

module.exports.dsn = "https://04c09d7c2a4941d4973b6706b417cc65@sentry.io/1389773";

module.exports.port = Object.freeze(3000);