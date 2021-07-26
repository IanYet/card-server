const data = {}
const constant = {
    ROOM_STATUS: {
        waiting: 'waiting',
        pre_round: 'pre_round',
        red_turn: 'red_turn',
        yellow_turn: 'yellow_turn',
        blue_turn: 'blue_turn',
        green_turn: 'green_turn',
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
