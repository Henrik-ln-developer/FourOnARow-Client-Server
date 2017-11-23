const model = (() => {
    const array = (length, init) => Array.apply(null, new Array(length)).map(init || (_ => undefined))

    //const updateArray = (a, i, f) => a.map((e, j) => (i === j) ? f(e, j) : e)
    const updateArray = function(a, i, f)
    {
        return a.map((e, j) => (i === j) ? f(e, j) : e)
    }

    function createModel(board, inTurn, gameNumber) {
        const setTile = (board, x, y, value) => updateArray(board, x, row => updateArray(row, y, _ => value))
        const tile = (x, y) => board[x][y]
        
        const verticalrow = (x, y, dx, dy) => array(board.length, (_, i) => ({x: x + i * dx, y: y + i * dy}))
        const horizontalRow = (x, y, dx, dy) => array(board[0].length, (_, i) => ({x: x + i * dx, y: y + i * dy}))
        const diagonalrow = (x, y, dx, dy, length) => array(length, (_, i) => ({x: x + i * dx, y: y + i * dy}))
        const verticalRows = array(board[0].length, (_, i) => verticalrow(0, i, 1, 0))
        const horizontalRows = array(board.length, (_, i) => horizontalRow(i, 0, 0, 1))
        const diagonalRows = [diagonalrow(2, 0, 1, 1, 4), diagonalrow(1, 0, 1, 1, 5), diagonalrow(0, 0, 1, 1, 6), diagonalrow(0, 1, 1, 1, 6), diagonalrow(0, 2, 1, 1, 5), diagonalrow(0, 3, 1, 1, 4), 
            diagonalrow(0, 3, 1, -1, 4), diagonalrow(0, 4, 1, -1, 5), diagonalrow(0, 5, 1, -1, 6), diagonalrow(0, 6, 1, -1, 6), diagonalrow(1, 6, 1, -1, 5, diagonalrow(2, 6, 1, -1, 4))]
        const allRows = verticalRows.concat(horizontalRows).concat(diagonalRows)
        const plateFull = board.every(row => row.every(x => x))
        const hasWon = function(theRow, candidate)
        {
            var count = 0;
            for(var i = 0; i < theRow.length; i++)
            {
                if(tile(theRow[i].x, theRow[i].y)  === candidate)
                {
                    count++
                }
                else
                {
                    count = 0
                }
                if(count >= 4)
                {
                    return true
                }
            }
            return false
        }
        
        const winningRow = (candidate) => allRows.find(x => hasWon(x, candidate))
        const getWinner = (candidate) => {
            const w = winningRow(candidate)
            return w && { winner: candidate, row : w }
        }
        const winner = () => getWinner('Red') || getWinner('Blue')
        const stalemate = () => plateFull && !winner()
        
        const playerInTurn = () => inTurn
        
        const legalMove = (x, y) => {
            if (x < 0 || y < 0 || x > 5 || y > 6) return false
            if (winner()) return false
            for(var i = x; i < 6; i++)
            {
                if (!tile(i, y))
                {
                    return true;
                }
            }
            return false;
        }
        
        const makeMove = (x, y) => {
            if (!legalMove(x, y)) throw 'Illegal move'
            var dx = -1
            for(var i = 0; i < 6; i++)
            {
                if (!tile(i, y))
                {
                    dx = i;
                }
            }
            return createModel(setTile(board, dx, y, inTurn), (inTurn === 'Red') ? 'Blue' : 'Red', gameNumber)
        }

        const getMove = (x, y) => {
            if (!legalMove(x, y)) throw 'Illegal move'
            var dx = -1
            for(var i = x; i < 6; i++)
            {
                if (!tile(i, y))
                {
                    dx = i;
                }
            }
            return {x : dx, y : y}
        }
        
        const json = () => JSON.stringify({board, inTurn, winner: winner(), stalemate: stalemate(), gameNumber})
        return { tile, winner, stalemate, playerInTurn, legalMove, makeMove, getMove, board, json, gameNumber }
    }

    return gameNumber => createModel(array(6, _ => array(7)), 'Red', gameNumber)
})()

module.exports = model
