# qn-ueditor
express ueditor七牛上传中间件

useage: 
```
var qnUeditor = require('qn-ueditor');

qnUeditor.create({
    accessKey: config.accessKey,
    secretKey: config.secretKey,
    bucket: config.bucket,
    origin: config.origin
});

app.use("/vendor/ueditor/ue", qnUeditor.ueditor(function(req, res, next) {
    if (req.query.action === 'config') {
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/vendor/ueditor-bower/ueditor.config.json')
    }
}));
```