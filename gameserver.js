const express = require('express')
const model = require('./model.js')
const ai = require('./player.js')

const games = []

const gameserver = express()

gameserver.use (function(req, res, next) {
    // Gives remote access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    req.setEncoding('utf8')
    req.body = new Promise(resolve => {
        let data=''
        req.on('data', function(chunk) { 
            data += chunk
         });
         req.on('end', function() {
             resolve(data)
             next();
         });
    })
});

gameserver.use(express.static('static'))

gameserver.post('/clean', (_, res) => {
    console.log(games)
    games.push(model(games.length))
    res.send(games[games.length - 1].json())
});

gameserver.post('/move', (req, res) => {
    req.body
    .then(JSON.parse)
    .then( ({ x, y, gameNumber }) => {
        const game = games[gameNumber]
        console.log("Wanted move: X: " + x + ", Y: " + y)
        /*console.log("Board state: ")
            for(var i = 0; i < game.board.length; i++) {
                var row = game.board[i];
                for(var j = 0; j < row.length; j++) {
                    console.log("Tile[" + i + "][" + j + "] = " + row[j]);
                }
            }*/
        if (game.legalMove(x,y)) 
        {
            console.log("It's a legal move")
            const myMove = game.getMove(x, y)
            console.log("My move: X: " + myMove.x + ", Y: " + myMove.y)
            const afterMove = game.makeMove(x, y)
            const aiMove = ai(afterMove)
            if(aiMove)
            {
                //console.log("Random AI move: X: " + aiMove.x + ", Y: " + aiMove.y)
                const realAiMove = afterMove.getMove(aiMove.x, aiMove.y)
                if (realAiMove) 
                {
                    console.log("AI move: X: " + realAiMove.x + ", Y: " + realAiMove.y)
                    const afterAI = afterMove.makeMove(realAiMove.x, realAiMove.y)
                    games[gameNumber] = afterAI
                    res.send(JSON.stringify({ 
                        moves: [{x : myMove.x, y : myMove.y, player: game.playerInTurn()}, Object.assign(realAiMove, { player: afterMove.playerInTurn() })], 
                        inTurn: afterAI.playerInTurn(), 
                        winner: afterAI.winner(), 
                        stalemate: afterAI.stalemate() }))
                } 
                else 
                {
                    console.log("There's no legal AI move 2")
                    games[gameNumber] = afterMove
                    res.send(JSON.stringify({ 
                        moves: [{x : myMove.x, y : myMove.y, player: game.playerInTurn()}], 
                        inTurn: afterMove.playerInTurn(), 
                        winner: afterMove.winner(), 
                        stalemate: afterMove.stalemate()  }))
                }
            }
            else
            {
                console.log("There's no legal AI move")
                games[gameNumber] = afterMove
                res.send(JSON.stringify({ 
                    moves: [{x : myMove.x, y : myMove.y, player: game.playerInTurn()}], 
                    inTurn: afterMove.playerInTurn(), 
                    winner: afterMove.winner(), 
                    stalemate: afterMove.stalemate()  }))
            }
        } 
        else 
        {
            console.log("It's not a legal move")
            res.send(JSON.stringify({ 
                moves: [], 
                inTurn: game.playerInTurn(), 
                winner: game.winner(), 
                stalemate: game.stalemate() }))
        }
    })
});


gameserver.listen(8080, () => console.log('Gameserver listening on 8080'))
