module.exports = function (app) {
	
    app.get('/', function(req, res) {
        res.sendFile('/public/index.html', {root: 'clientFiles' });
    });
    
    app.get('/main.js', function(req, res) {
        res.sendFile('/src/main.js', {root: 'clientFiles' });
    });
    
    app.get('/Wieser.png', function(req, res) {
        res.sendFile('/images/Wieser.png', {root: 'clientFiles' });
    });
    
    app.get('/testmap.png', function(req, res) {
        res.sendFile('/images/testmap.png', {root: 'clientFiles' });
    });
};
