var http = require('http'),
    os = require('os'),
    fs = require('fs'),
    path = require('path'),

    Busboy = require('busboy'),
    qn = require('qn');


var client = null;

exports.create = function(options) {
    client = qn.create({
        accessKey: options.accessKey,
        secretKey: options.secretKey,
        bucket: options.bucket,
        origin: options.origin
    });
    client.options = options;
}

exports.ueditor = function(handel) {
    return function(req, res, next) {
        var _respond = respond(handel);
        _respond(req, res, next);
    };
}

var respond = function(callback) {
    return function(req, res, next) {
        if (req.query.action === 'config') {
            callback(req, res, next);
            return;
        } else if (req.query.action === 'listimage') {
            client.list('/', function(err, result) {
                if (err) throw err;
                var list = result.items;
                var filtered = list.filter(item => {
                    return item.mimeType.indexOf('image') >= 0;
                });
                filtered.forEach(item => {
                    item.url = client.options.origin + item.key;
                });
                res.json({
                    "state": "SUCCESS",
                    "list": filtered,
                    "start": 1,
                    "total": filtered.length
                });
            });
            callback(req, res, next);

        } else if (req.query.action === 'uploadimage') {

            var busboy = new Busboy({
                headers: req.headers
            });

            busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                var saveTo = path.join(os.tmpDir(), path.basename(filename));
                file.pipe(fs.createWriteStream(saveTo));
                res.ue_up = function() {
                    var tmpdir = path.join(os.tmpDir(), path.basename(filename));
                    var readStream = fs.createReadStream(tmpdir);
                    client.upload(readStream, {
                        type: mimetype
                    }, function(err, result) {
                        if (err) throw err;
                        fs.unlink(saveTo);
                        res.json({
                            'url': result.url,
                            'title': req.body.pictitle,
                            'original': filename,
                            'state': 'SUCCESS'
                        });
                    });
                };
            });
            busboy.on('finish', function() {
                res.ue_up();
                callback(req, res, next);
            });
            req.pipe(busboy);
        } else {
            callback(req, res, next);
        }
        return;
    };
};