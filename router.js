module.exports = function (app) {
	
//html

    app.get('/', function(req, res) {
        res.sendFile('/public/index.html', {root: 'clientFiles' });
    });
    
//scripts

    app.get('/main.js', function(req, res) {
        res.sendFile('/src/main.js', {root: 'clientFiles' });
    });

    app.get('/socket.js', function(req, res) {
        res.sendFile('/src/socket.js', {root: 'clientFiles' });
    });

    app.get('/Events.js', function(req, res) {
        res.sendFile('/src/Events.js', {root: 'clientFiles' });
    });

    //Movement Collision Scripts
    app.get('/borderFunctions.js', function(req, res) {
        res.sendFile('/src/Movement_Collision/borderFunctions.js', {root: 'clientFiles' });
    });

    app.get('/movement.js', function(req, res) {
        res.sendFile('/src/Movement_Collision/movement.js', {root: 'clientFiles' });
    });

    app.get('/MovementCollisionEvents.js', function(req, res) {
        res.sendFile('/src/Movement_Collision/MovementCollisionEvents.js', {root: 'clientFiles' });
    });

//css

    
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
