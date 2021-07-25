const data = {}
const constant = {
    ROOM_STATUS: {
        waiting: 'waiting',
        pre_round: 'pre_round',
        your_turn: 'your_ turn',
        other_turn: 'other_turn',
        round_end: 'round_end',
        end: 'game_end',
    },
    WS_TYPE: {
        setColor: 'setColor',
        chat: 'chat',
        step: 'step',
    },
}

module.exports = { data, constant }
