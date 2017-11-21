const express = require('express')
const model = require('./model.js')
const ai = require('./player.js')

const games = []

const gameserver = express()

gameserver.use (function(req, res, next) {
    // Gives remote access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    
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
        if (game.legalMove(x,y)) 
        {
            console.log("Is legal move")
            const myMove = game.getMove(x, y)
            console.log("MY MOVE: X: " + myMove.x + ", Y: " + myMove.y)
            const afterMove = game.makeMove(x, y)
            console.log("Board after move: " + afterMove.board)
            for(var i = 0; i < afterMove.board.length; i++) {
                var row = afterMove.board[i];
                for(var j = 0; j < row.length; j++) {
                    console.log("Tile[" + i + "][" + j + "] = " + row[j]);
                }
            }

            const aiMove = ai(afterMove)
            if (aiMove) 
            {
                console.log("AI made a move")
                const afterAI = afterMove.makeMove(aiMove.x, aiMove.y)
                console.log("Board after AI: " + afterAI.board)
                console.log("Board after AI: ")
                for(var i = 0; i < afterAI.board.length; i++) {
                    var row = afterAI.board[i];
                    for(var j = 0; j < row.length; j++) {
                        console.log("Tile[" + i + "][" + j + "] = " + row[j]);
                    }
                }
                games[gameNumber] = afterAI
                res.send(JSON.stringify({ 
                    moves: [{x : myMove.x, y : myMove.y, player: game.playerInTurn()}, Object.assign(aiMove, { player: afterMove.playerInTurn() })], 
                    inTurn: afterAI.playerInTurn(), 
                    winner: afterAI.winner(), 
                    stalemate: afterAI.stalemate() }))
            } 
            else 
            {
                console.log("No AI move")
                games[gameNumber] = afterMove
                res.send(JSON.stringify({ 
                    moves: [{x, y, player: game.playerInTurn()}], 
                    inTurn: afterMove.playerInTurn(), 
                    winner: afterMove.winner(), 
                    stalemate: afterMove.stalemate()  }))
            }
        } 
        else 
        {
            console.log("Not legal move")
            res.send(JSON.stringify({ 
                moves: [], 
                inTurn: game.playerInTurn(), 
                winner: game.winner(), 
                stalemate: game.stalemate() }))
        }
    })
});


gameserver.listen(8080, () => console.log('Gameserver listening on 8080'))
