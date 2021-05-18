module.exports = function (app) {
	
    app.get('/', function(req, res) {
        res.sendFile('/public/index.html', {root: 'clientFiles' });
    });
    
    app.get('/main.js', function(req, res) {
        res.sendFile('/src/main.js', {root: 'clientFiles' });
    });

    app.get('/borderFunctions.js', function(req, res) {
        res.sendFile('/src/borderFunctions.js', {root: 'clientFiles' });
    });

    app.get('/socket.js', function(req, res) {
        res.sendFile('/src/socket.js', {root: 'clientFiles' });
    });

    app.get('/events.js', function(req, res) {
        res.sendFile('/src/events.js', {root: 'clientFiles' });
    });
    
//images

    app.get('/Wieser.png', function(req, res) {
        res.sendFile('/images/Wieser.png', {root: 'serverFiles' });
    });
    
    app.get('/testmap.png', function(req, res) {
        res.sendFile('/images/testmap.png', {root: 'serverFiles' });
    });
    
    app.get('/testmapKlein.png', function(req, res) {
        res.sendFile('/images/testmapKlein.png', {root: 'serverFiles' });
    });
};
