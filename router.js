module.exports = function (app) {
  //html

  app.get("/", function (req, res) {
    res.sendFile("/public/index.html", { root: "clientFiles" });
  });

  app.get("/game/:room", function (req, res) {
    res.sendFile("/public/game.html", { root: "clientFiles" });
  });

  //scripts

  app.get("/script/main.js", function (req, res) {
    res.sendFile("/src/main.js", { root: "clientFiles" });
  });

  app.get("/script/requests.js", function (req, res) {
    res.sendFile("/src/requests.js", { root: "clientFiles" });
  });

  app.get("/script/socket.js", function (req, res) {
    res.sendFile("/src/socket.js", { root: "clientFiles" });
  });

  app.get("/script/events.js", function (req, res) {
    res.sendFile("/src/events.js", { root: "clientFiles" });
  });

  app.get("/script/lobby.js", function (req, res) {
    res.sendFile("/src/lobby/lobby.js", { root: "clientFiles" });
  });

  app.get("/script/lobbyEvents.js", function (req, res) {
    res.sendFile("/src/lobby/lobbyEvents.js", { root: "clientFiles" });
  });

  app.get("/script/roleReveal.js", function (req, res) {
    res.sendFile("/src/roleReveal.js", { root: "clientFiles" });
  });

  app.get("/script/emergencyMeeting.js", function (req, res) {
    res.sendFile("/src/emergencyMeeting.js", { root: "clientFiles" });
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

  app.get("/style/hudStyles.css", function (req, res) {
    res.sendFile("/public/css/hudStyles.css", {
      root: "clientFiles",
    });
  });
  
  app.get("/style/game.css", function (req, res) {
    res.sendFile("/public/css/game.css", {
      root: "clientFiles",
    });
  });

  //images

  app.get("/img/Wieser.png", function (req, res) {
    res.sendFile("/images/Wieser.png", { root: "serverFiles" });
  });

  app.get("/img/HTL3Floor.png", function (req, res) {
    res.sendFile("/images/HTL3Floor.png", { root: "serverFiles" });
  });

  app.get("/img/HTL3FloorBorder.png", function (req, res) {
    res.sendFile("/images/HTL3FloorBorder.png", { root: "serverFiles" });
  });

  app.get("/img/HTL3FloorTop.png", function (req, res) {
    res.sendFile("/images/HTL3FloorTop.png", { root: "serverFiles" });
  });

  app.get("/img/testmap.png", function (req, res) {
    res.sendFile("/images/testmap.png", { root: "serverFiles" });
  });

  app.get("/img/testmapKlein.png", function (req, res) {
    res.sendFile("/images/testmapKlein.png", { root: "serverFiles" });
  });
  
  app.get("/img/megaphone.png", function (req, res) {
    res.sendFile("/images/megaphone.png", { root: "serverFiles" });
  });
};
