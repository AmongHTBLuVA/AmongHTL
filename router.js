module.exports = function (app) {
  //html

  app.get("/", function (req, res) {
    res.sendFile("/public/index.html", { root: "clientFiles" });
  });

  app.get("/game", function (req, res) {
    res.sendFile("/public/game.html", { root: "clientFiles" });
  });

  //scripts

  app.get("/script/main.js", function (req, res) {
    res.sendFile("/src/main.js", { root: "clientFiles" });
  });

  app.get("/script/socket.js", function (req, res) {
    res.sendFile("/src/socket.js", { root: "clientFiles" });
  });

  app.get("/script/lobby.js", function (req, res) {
    res.sendFile("/src/lobby.js", { root: "clientFiles" });
  });

  app.get("/script/Events.js", function (req, res) {
    res.sendFile("/src/Events.js", { root: "clientFiles" });
  });

  //Movement Collision Scripts
  app.get("/script/borderFunctions.js", function (req, res) {
    res.sendFile("/src/Movement_Collision/borderFunctions.js", {
      root: "clientFiles",
    });
  });

  app.get("/script/movement.js", function (req, res) {
    res.sendFile("/src/Movement_Collision/movement.js", {
      root: "clientFiles",
    });
  });

  app.get("/script/MovementCollisionEvents.js", function (req, res) {
    res.sendFile("/src/Movement_Collision/MovementCollisionEvents.js", {
      root: "clientFiles",
    });
  });

  //css

  app.get("/style/lobbyStyles.css", function (req, res) {
    res.sendFile("/public/css/lobbyStyles.css", {
      root: "clientFiles",
    });
  });
  
  app.get("/style/userNameInput.css", function (req, res) {
    res.sendFile("/public/css/userNameInput.css", {
      root: "clientFiles",
    });
  });

  app.get("/style/buffer.css", function (req, res) {
    res.sendFile("/public/css/buffer.css", {
      root: "clientFiles",
    });
  });
  
  //images

  app.get("/img/Wieser.png", function (req, res) {
    res.sendFile("/images/Wieser.png", { root: "serverFiles" });
  });

  app.get("/img/testmap.png", function (req, res) {
    res.sendFile("/images/testmap.png", { root: "serverFiles" });
  });

  app.get("/img/testmapKlein.png", function (req, res) {
    res.sendFile("/images/testmapKlein.png", { root: "serverFiles" });
  });
};
