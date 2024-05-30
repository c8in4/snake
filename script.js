/*
to dos:
- responsive canvas size
    - kind of solved (css - canvas - max-width)
- let user change gamespeed
- let user change cols and rows
- timer for "competetive" playing
*/

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let snake = [
    { x: 0, y: 0 }
];
let food;

//game settings
let cols = 12;
let rows = 12;
let gameSpeed = 150;
let gameInterval;

let cellWidth = canvas.width / cols;
let cellHeight = canvas.height / rows;
let gameRunning = false;
let direction = "right";
let gameReset = true;
let gameLost = false;

let count = 0;

placeFood();
draw();

let button = document.getElementById("startButton");
button.addEventListener("click", startGame);

function startGame() {
    if (!gameRunning && !gameLost) {
        gameInterval = setInterval(gameLoop, gameSpeed);
        gameRunning = true;
        gameReset = false;
        startButton.innerText = "Pause";
        document.addEventListener("keydown", keyDown);
        document.addEventListener('touchstart', handleTouchStart, false);
        document.addEventListener('touchmove', handleTouchMove, false);
    } else if (!gameRunning && gameLost) {
        startButton.innerText = "Reset";
        resetGame();
    } else {
        clearInterval(gameInterval);
        gameRunning = false;
        startButton.innerText = "Start";
    }

}

function resetGame() {
    if (!gameRunning) {
        snake = [
            { x: 0, y: 0 }
        ];
        placeFood();
        checkScore();
        gameReset = true;
        gameLost = false;
        direction = "right";
        gameSpeed = 150;
        clearInterval(gameInterval);
        count = 0;
        counter.innerText = "0";
        startButton.innerText = "Start";
    }
}

function gameOver() {
    let firstPart = snake[0];
    let otherParts = snake.slice(1);
    let duplicatePart = otherParts.find(part => part.x == firstPart.x && part.y == firstPart.y)

    if (duplicatePart) {
        clearInterval(gameInterval);
        gameRunning = false;
        gameReset = false;
        gameLost = true;
        startButton.innerText = "Reset";
        // alert("Game Over! Try again!");
    }
}

//update highscore
function checkScore() {
    let oldScore = document.getElementById("highScore");
    if (oldScore.innerText < count) {
        oldScore.innerText = count;
    }
}

function draw() {
    let snakeHead = snake[0];
    let snakeBody = snake.slice(1);

    //background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //snake head
    ctx.fillStyle = "yellow";
    add(snakeHead.x, snakeHead.y);

    //snake body
    ctx.fillStyle = "green";
    snakeBody.forEach(part => add(part.x, part.y));

    //food
    ctx.fillStyle = "red";
    add(food.x, food.y);

    requestAnimationFrame(draw);
}

function gameLoop() {
    foodCollected();
    moveSnake();
    gameOver();
}


function foodCollected() {
    if (snake[0].x == food.x && snake[0].y == food.y) {
        count++;
        counter.innerText = count;
        snake = [{ x: snake[0].x, y: snake[0].y }, ...snake];
        placeFood();
    }
}

function moveSnake() {

    //segments follow head
    for (let i = snake.length - 1; i > 0; i--) {
        const part = snake[i];
        const lastPart = snake[i - 1];
        part.x = lastPart.x;
        part.y = lastPart.y;
    }

    //change direction
    if (direction == "right") {
        snake[0].x++;
    }
    if (direction == "down") {
        snake[0].y++;
    }
    if (direction == "left") {
        snake[0].x--;
    }
    if (direction == "up") {
        snake[0].y--;
    }

    //go through walls
    if (snake[0].x == cols) {
        snake[0].x = 0;
    }
    if (snake[0].x == -1) {
        snake[0].x = cols - 1;
    }
    if (snake[0].y == rows) {
        snake[0].y = 0;
    }
    if (snake[0].y == -1) {
        snake[0].y = rows - 1;
    }
}

function add(x, y) {
    ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth - 1, cellHeight - 1);
}

//spawn food
function placeFood() {
    let randomX;
    let randomY;
    //don't spawn on snake
    do {
        randomX = Math.floor(Math.random() * cols);
        randomY = Math.floor(Math.random() * rows);
    }
    while (snake.find(part => part.x == randomX && part.y == randomY));

    food = { x: randomX, y: randomY };
}

//get keyboard input
function keyDown(e) {
    if (e.keyCode == 37 && direction != "right") {
        direction = "left";
    }
    if (e.keyCode == 38 && direction != "down") {
        direction = "up";
    }
    if (e.keyCode == 39 && direction != "left") {
        direction = "right";
    }
    if (e.keyCode == 40 && direction != "up") {
        direction = "down";
    }
}


//get touch input

let xDown = null;
let yDown = null;

function getTouches(evt) {
    return evt.touches || // browser API
        evt.originalEvent.touches; // jQuery
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
};

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) { //most significant
        if (xDiff > 0 && direction != "right") {
            // left swipe
            direction = "left";
        }
        if (direction != "left") {
            // right swipe
            direction = "right";

        }
    } else {
        if (yDiff > 0 && direction != "down") {
            // up swipe
            direction = "up";
        }
        if (direction != "up") {
            // down swipe
            direction = "down";
        }

    }
    // reset values
    xDown = null;
    yDown = null;
};