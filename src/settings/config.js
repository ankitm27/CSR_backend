// module.exports.cache = Object.freeze({
//     HOST: "127.0.0.1",
//     PORT: 6379
// });

module.exports.db = Object.freeze({
    HOST: "127.0.0.1",
    PORT: 27017,
    NAME: "wpf_csr"
});

module.exports.jwtSecret = Object.freeze("04c09d7c2a4941d4973b6706b417cc65");

module.exports.dsn = Object.freeze("https://04c09d7c2a4941d4973b6706b417cc65@sentry.io/1389773");

module.exports.port = Object.freeze(3000);

module.exports.mediaPath = Object.freeze("media/");

module.exports.apiBaseUrl = Object.freeze("http://127.0.0.1:3000/");

module.exports.jwtSecretExpirationInSeconds = Object.freeze(60*60*24*365);

Object.freeze("http://13.232.210.179/");
