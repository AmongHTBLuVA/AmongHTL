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

  app.get("/script/task.js", function (req, res) {
    res.sendFile("/src/task.js", { root: "clientFiles" });
  });

  app.get("/script/skinManagement.js", function (req, res) {
    res.sendFile("/src/skinManagement.js", { root: "clientFiles" });
  });

  app.get("/script/fish", function(req, res) {
    res.sendFile(`/FishTask/main.js`, { root: "Tasks", dotfiles: "allow" });
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

  app.get("/style/fish", function(req, res) {
    res.sendFile(`/FishTask/styles.css`, { root: "Tasks", dotfiles: "allow" });
  });

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

  app.get("/img/skin/:type", function(req, res) {
    var skin = req.params["type"];
    res.sendFile(`/images/wiesers/${skin}`, { root: "serverFiles", dotfiles: "allow" });
  });

  app.get("/img/fish/:type", function(req, res) {
    var skin = req.params["type"];
    res.sendFile(`/FishTask/images/${skin}`, { root: "Tasks", dotfiles: "allow" });
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

  app.get("/img/WieserDeadOverlay.png", function (req, res) {
    res.sendFile("/images/WieserDeadOverlay.png", { root: "serverFiles" });
  });
  
  //tasks

  app.get("/Tasks/:task", function(req, res) {
    var task = req.params["task"];
    res.sendFile(`/${task}/`, { root: "Tasks", dotfiles: "allow" });
  });

  app.get("/Tasks/:task/main.js", function(req, res) {
    var task = req.params["task"];
    res.sendFile(`/${task}/main.js`, { root: "Tasks", dotfiles: "allow" });
  });

  app.get("/Tasks/:task/styles.css", function(req, res) {
    var task = req.params["task"];
    res.sendFile(`/${task}/styles.css`, { root: "Tasks", dotfiles: "allow" });
  });
};
