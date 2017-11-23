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
        
        const row = (x, y, dx, dy) => array(board.length, (_, i) => ({x: x + i * dx, y: y + i * dy}))
        const verticalRows = array(board.length, (_, i) => row(0, i, 1, 0))
        const horizontalRows = array(board.length, (_, i) => row(i, 0, 0, 1))
        const diagonalRows = [row(0, 0, 1, 1), row(0, 2, 1, -1)]
        const allRows = verticalRows.concat(horizontalRows).concat(diagonalRows)
        const plateFull = board.every(row => row.every(x => x))
        
        //const hasWon = (theRow, candidate) =>  theRow.every(({x, y}) => tile(x, y) === candidate)
        const hasWon = function(theRow, candidate)
        {
            //return theRow.every(({x, y}) => tile(x, y) === candidate)
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
                    //console.log("Putting mark in: {X: " + dx + ", Y: " + y + "}")
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
                    //console.log("Putting mark in: {X: " + dx + ", Y: " + y + "}")
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
