'use strict'

// Cell types
const WALL = 'WALL'
const FLOOR = 'FLOOR'
const WORMHOLE = 'WHORMHOLE'
const GLUE = 'GLUE'

// Game elements
const BALL = 'BALL'
const GAMER = 'GAMER'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const CANDY_IMG = '<img src="img/candy.png">'

// Model:
var gBoard
var gGamerPos

var gScoreCount = 0
var gBallNgCount = 0
var gBallBoardCount = 0
var msBallGenrationTime = 5000

//booleans
var gIsGamerStuck = false
var gIsGameRunning = true

function initGame() {

		gGamerPos = { i: 2, j: 9 }
		gBoard = buildBoard()
		renderBoard(gBoard)
		setInterval(countNeighborBall, 30)
		setInterval(isGamePlaying, 30)
		setInterval(createGlueCandies, 5000)
	
}

function isGamePlaying() {
	if (gBallBoardCount === 0) {
		gIsGameRunning = false
	}


	console.log(gBallBoardCount)
	if (!gIsGameRunning) {
		gameOver()
		return
	}
}

function buildBoard() {
	// TODO: Create the Matrix 10 * 12 
	const board = createMat(10, 12)
	console.log(board)

	// TODO: Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			var type = FLOOR
			if (i === 0 && j === 6 || i === board.length - 1 && j === 6) {
				type = WORMHOLE
			} else if (i === 4 && j === board[0].length - 1 || i === 4 && j === 0) {
				type = WORMHOLE
			} else if (i === 0 || i === board.length - 1 || j === 0 || j === board[i].length - 1) {
				type = WALL
			}
			board[i][j] = { type: type, gameElement: null }
		}
	}
	// TODO: Place the gamer and two balls
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
	if (scoreCount > 10) msBallGenrationTime = 700
	if (scoreCount > 20) msBallGenrationTime = 500
	setInterval(randomBalls, msBallGenrationTime, board)

	// console.log(board)
	return board
}

function randomBalls(board) {
	let iIndex = getRandomInt(1, board.length - 1)
	let jIndex = getRandomInt(1, board.length - 1)

	while (board[iIndex][jIndex].gameElement === GAMER) {
		iIndex = getRandomInt(1, board.length - 1)
		jIndex = getRandomInt(1, board.length - 1)
	}

	board[iIndex][jIndex].gameElement = BALL
	renderCell({ i: iIndex, j: jIndex })
	renderBoard(board)
	gBallBoardCount++

}

// Render the board to an HTML table
function renderBoard(board) {

	const elBoard = document.querySelector('.board')
	var strHTML = ''

	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n'
		for (var j = 0; j < board[0].length; j++) {
			const currCell = board[i][j]

			var cellClass = getClassName({ i, j })

			if (currCell.type === FLOOR) cellClass += ' floor'
			else if (currCell.type === WALL) cellClass += ' wall'
			else if (currCell.type === WORMHOLE) cellClass += ' wormhole'
			else if (currCell.type === GLUE) cellClass += ' glue'

			// strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n'
			strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i},${j})">`

			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG
			} else if (currCell.gameElement === GLUE) {
				strHTML += CANDY_IMG
			}

			strHTML += '</td>\n'
		}
		strHTML += '</tr>\n'
	}
	// console.log('strHTML is:')
	// console.log(strHTML)
	elBoard.innerHTML = strHTML
	// console.log(board)
}

// Move the player to a specific location
function moveTo(i, j) {
	if (gIsGamerStuck) return

	const fromCell = gBoard[gGamerPos.i][gGamerPos.j]
	const toCell = gBoard[i][j]


	if (toCell.type === WALL) return

	// Calculate distance to make sure we are moving to a neighbor cell
	const iAbsDiff = Math.abs(i - gGamerPos.i)
	const jAbsDiff = Math.abs(j - gGamerPos.j)

	// If the clicked Cell is one of the four allowed
	// if ((iAbsDiff + jAbsDiff === 1)) {


	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

		if (toCell.gameElement === BALL) {
			console.log('Collecting!')
			scoreCount()
			gBallBoardCount--
		}

		if (toCell.type === WORMHOLE) {
			// Find the opposite wormhole
			let oppositePos = findOppositeWormhole(i, j)

			// Move the gamer from current position
			fromCell.gameElement = null
			renderCell(gGamerPos, null)

			// Move to the opposite wormhole
			gBoard[oppositePos.i][oppositePos.j].gameElement = GAMER
			renderCell(oppositePos, GAMER_IMG)

			// Update gamer position
			gGamerPos = oppositePos
			return
		}

		if (toCell.type === GLUE) {
			fromCell.gameElement = null
			renderCell(gGamerPos, null)

			toCell.gameElement = GAMER
			toCell.type = FLOOR
			renderCell({ i, j }, GAMER_IMG)

			gGamerPos = { i, j }

			gIsGamerStuck = true
			setTimeout(() => {
				gIsGamerStuck = false
			}, 3000)

		}
		// TODO: Move the gamer

		fromCell.gameElement = null
		renderCell(gGamerPos, null)

		toCell.gameElement = GAMER
		renderCell({ i, j }, GAMER_IMG)

		gGamerPos = { i, j }    // same as - { i: i, j: j }

	} else console.log('TOO FAR', iAbsDiff, jAbsDiff)

}

function findOppositeWormhole(i, j) {
	if (i === 0 && j === 6) return { i: 8, j: 6 }
	if (i === 9 && j === 6) return { i: 1, j: 6 }
	if (i === 4 && j === 0) return { i: 4, j: 10 }
	if (i === 4 && j === 11) return { i: 4, j: 1 }
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	const cellSelector = '.' + getClassName(location)
	const elCell = document.querySelector(cellSelector)
	elCell.innerHTML = value
}

// Move the player by keyboard arrows
function handleKey(event) {
	const i = gGamerPos.i
	const j = gGamerPos.j

	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1)
			break
		case 'ArrowRight':
			moveTo(i, j + 1)
			break
		case 'ArrowUp':
			moveTo(i - 1, j)
			break
		case 'ArrowDown':
			moveTo(i + 1, j)
			break
	}
}

// Returns the class name for a specific cell
function getClassName(position) {
	const cellClass = `cell-${position.i}-${position.j}`
	return cellClass
}

function getRandomInt(min, max) {
	const minCeiled = Math.ceil(min)
	const maxFloored = Math.floor(max)
	return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}

function scoreCount() {
	gScoreCount++
	let score = document.querySelector('.info .score-count')
	// console.log(score)
	score.innerText = `score: ${gScoreCount}`
}

function countNeighborBall() {
	let ngBalls = document.querySelector('.info .neighbor-ball')
	gBallNgCount = 0

	for (let i = gGamerPos.i - 1; i <= gGamerPos.i + 1; i++) {
		for (let j = gGamerPos.j - 1; j <= gGamerPos.j + 1; j++) {
			if (gBoard[i][j].gameElement === WORMHOLE) continue

			if (gBoard[i][j].gameElement === GAMER) continue

			if (gBoard[i][j].gameElement === BALL) gBallNgCount++
		}
	}
	ngBalls.innerText = `neighbors: ${gBallNgCount}`
}

function createGlueCandies() {
	let iIndex = getRandomInt(1, gBoard.length - 1)
	let jIndex = getRandomInt(1, gBoard[0].length - 1)

	// Only place candy if the cell is empty
	if (gBoard[iIndex][jIndex].gameElement === null) {
		gBoard[iIndex][jIndex].type = GLUE
		gBoard[iIndex][jIndex].gameElement = GLUE
		renderCell({ i: iIndex, j: jIndex }, CANDY_IMG)

		// Destroy the candy after 3 seconds if not collected
		setTimeout(() => {
			// Check if the candy is still there (wasn't collected by gamer)
			if (gBoard[iIndex][jIndex].type === GLUE) {
				gBoard[iIndex][jIndex].type = FLOOR
				gBoard[iIndex][jIndex].gameElement = FLOOR
				renderCell({ i: iIndex, j: jIndex }, '')
			}
		}, 3000)
	}
}

function gameOver() {
	let button = document.querySelector('.restart')

	button.innerHTML = `<button class="restart-btn" onclick="resartGame()"> restart</button>`
}

function resartGame() {
	gIsGameRunning = true
	document.querySelector('.restart').innerHTML = ''
	initGame()
}

// function destroyGlueCandies(candyCell){
// 	candyCell.type = FLOOR
// 	candyCell.gameElement = FLOOR
// }