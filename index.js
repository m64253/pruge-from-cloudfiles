var request = require('request'),
    async = require('async'),
    
    purge = function (paths) {
        console.log('Starting purge for "' + paths.join(', ')    + '"');

        request({
            method: 'GET',
            uri: 'https://lon.auth.api.rackspacecloud.com/v1.0',
            headers: {
                "X-Auth-User": process.env.USER,
                "X-Auth-Key": process.env.API_KEY
            }
        }, function (err, res) {
            if (err) {
                throw err;
            }

            var authToken = res.headers['x-auth-token'],
                managementUrl = res.headers['x-cdn-management-url'];

            async.forEach(paths, function (path, done) {
                request({
                    method: 'DELETE',
                    uri: managementUrl + path,
                    headers: {
                        "X-Auth-Token": authToken,
                        "X-Purge-Email": process.env.EMAIL
                    }
                }, function (err, res, body) {
                    if (err) {
                        throw err;
                    }

                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log('Purge request for "' + path + '" sent!');
                    } else {
                        console.log(body);
                    }
                });
            })
        })
    };


var files = process.argv.slice(2);

if (files.length === 0 || !process.env.USER || !process.env.API_KEY || !process.env.EMAIL) {
    console.log('Usage: USER=foo API_KEY=bar EMAIL=foo@bar cfpurge /container/path/to.file /container/path/to.file  /container/path/to.file');
    process.exit();
}

purge(files);
