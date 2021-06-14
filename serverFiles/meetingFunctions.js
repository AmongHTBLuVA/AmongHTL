const {
  io,
  activeGames,
  votes,
  socketToSessionID,
  connectedUsers,
  killedPlayers,
  playerPos,
} = require("./dataStructures");
const { addKilledPlayer, getStartPoint } = require("./evaluationFunctions");

const votingTime = 200;

function copy(o) {
  return JSON.parse(JSON.stringify(o));
}

function getMeetingPlayerObj(roomKey, initiator) {
  let playerObjArr = [];
  let playerObj;
  Object.keys(activeGames[roomKey].players).forEach((playerID) => {
    playerObj = {};
    playerObj.id = socketToSessionID[playerID];
    playerObj.name = connectedUsers[socketToSessionID[playerID]].name;
    if (killedPlayers[roomKey]) {
      playerObj.killed =
        killedPlayers[roomKey][socketToSessionID[playerID]] != undefined
          ? true
          : false;
    } else {
      playerObj.killed = false;
    }
    playerObj.isInitator = initiator == playerID;
    playerObjArr.push(copy(playerObj));
  });
  return playerObjArr;
}

function getAlivePlayers(clientRoomKey) {
  let alive = activeGames[clientRoomKey].playerCount;
  if (killedPlayers[clientRoomKey]) {
    alive -= Object.keys(killedPlayers[clientRoomKey]).length;
  }
  return alive;
}

function getSkippedPlayers(clientRoomKey) {
  let playersVoted = [];
  Object.keys(votes[clientRoomKey]).forEach((sus) => {
    if (
      sus != "skip" &&
      sus != "totalVotes" &&
      sus != "voteEnds" &&
      sus != "initiator"
    ) {
      votes[clientRoomKey][sus].forEach((voted) => {
        playersVoted.push(voted);
      });
    }
  });
  let playersLeft = [];
  Object.keys(activeGames[clientRoomKey].players).forEach((player) => {
    if (
      !playersVoted.includes(socketToSessionID[player]) &&
      (!killedPlayers[clientRoomKey] ||
        !killedPlayers[clientRoomKey][socketToSessionID[player]])
    ) {
      playersLeft.push(socketToSessionID[player]);
    }
  });
  return playersLeft;
}

function evaluateVote(votes) {
  let maxVote = { tie: 0 };
  Object.keys(votes).forEach((sus) => {
    if (
      sus != "skip" &&
      sus != "totalVotes" &&
      sus != "voteEnds" &&
      sus != "initiator"
    ) {
      if (maxVote[Object.keys(maxVote)[0]] < votes[sus].length) {
        delete maxVote[Object.keys(maxVote)[0]];
        maxVote[sus] = votes[sus].length;
      } else if (maxVote[Object.keys(maxVote)[0]] == votes[sus].length) {
        delete maxVote[Object.keys(maxVote)[0]];
        maxVote["tie"] = votes[sus].length;
      }
    }
  });
  return Object.keys(maxVote)[0];
}

function eject(roomKey) {
  let ejected = evaluateVote(votes[roomKey]);
  if (ejected != "tie") {
    playerPos[roomKey][connectedUsers[ejected].socketID] = { x: 0, y: 0 };
    addKilledPlayer(roomKey, connectedUsers[ejected].socketID);
    let player = {};
    player.name = connectedUsers[ejected].name;
    player.role =
      activeGames[roomKey].players[connectedUsers[ejected].socketID].role;
    player.id = ejected;
    ejected = player;
  }
  return ejected;
}

module.exports = {
  setMeeting: function setMeeting(clientRoomKey, id) {
    Object.keys(playerPos[clientRoomKey]).forEach((playerID) => {
      if (
        playerPos[clientRoomKey][playerID].x != 0 ||
        playerPos[clientRoomKey][playerID].y != 0
      ) {
        playerPos[clientRoomKey][playerID] = getStartPoint(
          playerPos[clientRoomKey]
        );
      }
    });
    let meetingPlayerObj = getMeetingPlayerObj(
      clientRoomKey,
      !votes[clientRoomKey] ? id : votes[clientRoomKey].initiator
    );
    if (!votes[clientRoomKey]) {
      votes[clientRoomKey] = {};
      votes[clientRoomKey].totalVotes = 0;
      votes[clientRoomKey].skip = [];
      votes[clientRoomKey].initiator = id;
      votes[clientRoomKey].voteEnds = new Date().setTime(
        new Date().getTime() + (votingTime * 1000)
      );
    }
    activeGames[clientRoomKey].state = "meeting";
    io.to(clientRoomKey).emit("startEmergencyMeeting", meetingPlayerObj);
    io.to(clientRoomKey).emit("voteUpdate", votes[clientRoomKey]);
  },
  voteImposter: function voteImposter(votedPlayer, clientRoomKey, id) {
    if (votedPlayer == 0) {
      votes[clientRoomKey].skip.push(socketToSessionID[id]);
    } else {
      if (!votes[clientRoomKey][votedPlayer]) {
        votes[clientRoomKey][votedPlayer] = [];
      }
      votes[clientRoomKey][votedPlayer].push(socketToSessionID[id]);
    }
    votes[clientRoomKey].totalVotes += 1;
    io.to(clientRoomKey).emit(
      "voteUpdate",
      votes[clientRoomKey],
      socketToSessionID[id]
    );
    if (votes[clientRoomKey].totalVotes == getAlivePlayers(clientRoomKey)) {
      let ejected = eject(clientRoomKey);
      setTimeout(() => {
        io.to(clientRoomKey).emit(
          "showVoteResults",
          votes[clientRoomKey],
          ejected
        );
        votes[clientRoomKey] = undefined;
      }, 500);
    }
  },
  votingTimeUp: function votingTimeUp(clientRoomKey) {
    if (votes[clientRoomKey]) {
      let now = new Date();
      let voteEnds = new Date(votes[clientRoomKey].voteEnds);
      let secondsTillEnd =
        voteEnds.getSeconds() +
        voteEnds.getMinutes() * 60 -
        (now.getSeconds() + now.getMinutes() * 60);
      if (secondsTillEnd <= 0) {
        votes[clientRoomKey].skip = getSkippedPlayers(clientRoomKey);
        let ejected = eject(clientRoomKey);
        io.to(clientRoomKey).emit(
          "showVoteResults",
          votes[clientRoomKey],
          ejected
        );
        votes[clientRoomKey] = undefined;
      }
    }
  },
};
