module.exports = Object.freeze({
  MIN_PLAYERS: 4,
  PASSIVE_IDS: [35, 36],

  GOOGLE_SPREADSHEET_ID: '1rRKfvFjzKkI5rT6Q7vPANhn1NTAZ-7mPaCmoxgtmVu4',

  MSG_TYPES: {
    JOIN_ROOM: 'join_room',
    LEAVE_ROOM: 'leave_room',
    CREATE_ROOM: 'create_room',
    PLAYER_READY: 'player_ready',

    LOBBY_UPDATE: 'lobby_update',
    TERMS_UPDATE: 'terms_update',
    INIT_GAME_UPDATE: '',
    GAME_UPDATE: 'update',
    CHAT_UPDATE: 'chat_update',
    PLAYER_VOTE_STARTED: 'PLAYER_START_VOTE',
    JUSTIFICATION_STARTED: 'JUSTIFICATION',
    CHANGE_VOTE_STARTED: 'CHANGE_VOTE_STARTED',
    CHAC_OPEN_PROCESS_STARTED: 'CHAC_OPEN_PROCESS_START',
    GAME_OVER: 'dead',

    SEND_CHAT_MESSAGE: 'SEND_CHAT_MESSAGE',
    OPEN_CHAC: "OPEN_CHAC",
    PLAYER_VOTE: 'PLAYER_VOTE',

    USE_SPECCARD: 'USE_SPECCARD',
    SPECCARD_CHOOSE_PROC: "SPECCARD_CHOOSE_PROC",
    SPECCARD_CHOOSE_DONE: "SPECCARD_CHOOSE_DONE",
    SPECCARD_UPDATE: "SPECCARD_UPDATE",

    DIALOG_MESSAGE: 'DIALOG_MESSAGE',
  },

  SPECCARD_CHOOSE_TYPE: {
    LIVING_CHACS: 10,
    LIVING_EXCEPT_ME: 11,
    KICKED: 12,
  },

  ROOM_STATES: {
    LOBBY: 1,
    GAME: 2,
    RESULTS: 3,
  },

  ELECTIONS_STATES: {
    IN_PROGRESS: 4,
    FINISHED: 5,
  },

  GAME_STATES: {
    OPENING_CHACS: 6,
    ELECTION: 7,
    JUSTIFICATION: 8,
  }
});
