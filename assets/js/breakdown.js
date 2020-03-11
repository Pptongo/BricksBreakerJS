let canvas, ctx, x, y, ballRadius, dx, dy, paddleHeight, paddleWidth, paddleX, rightPressed, leftPressed, levels, level, bricks, score, lives, gameOver, button, moveBall;

const settings = {
    rows: 3,
    cols: 5,
    width: 75,
    height: 20,
    padding: 10,
    offsetTop: 30, 
    offsetLeft: 30
};

const colors = ['#0095DD', '#DD0095', '#95DD00', '#C4A200'];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start').addEventListener('click', hideInstructions);

    fetch('assets/js/levels.json').then(response => response.json().then(data => {
        levels = data;
        initialize();
        initListeners();
        document.getElementsByTagName('body')[0].style.visibility = 'visible';
    })).catch(err => console.error(err));
});

function hideInstructions() {
    document.getElementById('instructions').style.display = 'none';
    draw();
}

function initialize() {
    canvas = document.getElementById('canvasContainer');
    ctx = canvas.getContext('2d');
    ctx.textAlign = 'left';

    button = {
        x: canvas.width / 2 - 50,
        y: canvas.height / 2 - 10,
        width: 100,
        height: 50
    };

    score = 0;
    lives = 3;
    
    ballRadius = 10;
    
    paddleHeight = 10;
    paddleWidth = 75;

    rightPressed = false;
    leftPressed = false;

    level = 0;

    start();
    fillBricks();
}

function start() {
    x = canvas.width / 2;
    y = canvas.height - paddleHeight - ballRadius;
    dx = 5;
    dy = -5;
    paddleX = (canvas.width - paddleWidth) / 2;
    gameOver = false;
    moveBall = false;
}

function initListeners() {
    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    document.addEventListener('mousemove', mouseMoveHandler, false);
    canvas.addEventListener('click', (e) => {
        if(!gameOver && !moveBall) moveBall = true;
        if(isIntersect({x: e.clientX - canvas.offsetLeft, y: e.clientY - canvas.offsetTop})) initialize();
    });
}

function fillBricks() {
    bricks = [];

    for(let i in [...Array(settings.cols)]) {
        bricks[i] = [];

        for(let j in [...Array(settings.rows)]) {
            bricks[i][j] = {
                health: levels[level][j][i]
            };
        }
    }
}

function isIntersect(point) {
    return gameOver && point.x >= button.x && point.x <= (button.x + button.width) && point.y >= button.y && point.y <= (button.y + button.height);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(gameOver) {
        drawGameOver();
    } else {
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
        drawLives();
        collisionDetection();

        if(x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;

        if(y + dy < ballRadius) {
            dy = -dy;
        } else if(y + dy > canvas.height - ballRadius) {
            if(x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
            } else {
                lives--;

                if(!lives) { 
                    gameOver = true;
                } else {
                    start();
                }
            }
        }

        if(rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
        if(leftPressed && paddleX > 0) paddleX -= 7;

        if(moveBall) {
            x += dx;
            y += dy;
        } else {
            x = paddleX + paddleWidth / 2;
        }
    }

    requestAnimationFrame(draw);
}

function drawBricks() {
    for(let i in [...Array(settings.cols)]) {
        for(let j in [...Array(settings.rows)]) {
            const brick = bricks[i][j];

            if(brick.health > 0) {
                const brickX = (i * (settings.width + settings.padding)) + settings.offsetLeft;
                const brickY = (j * (settings.height + settings.padding)) + settings.offsetTop;
    
                brick.x = brickX;
                brick.y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, settings.width, settings.height);
                ctx.fillStyle = colors[brick.health - 1];
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = colors[0];
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = colors[0];
    ctx.fill();
    ctx.closePath();
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = colors[0];
    ctx.fillText(`Score: ${score}`, 8, 20);
}

function drawLives() {
    ctx.font = '16px Arial';
    ctx.fillStyle = colors[0];
    ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
}

function drawGameOver() {
    const message = getResult();

    ctx.font = '36px Arial';
    ctx.fillStyle = colors[0];
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 40);

    ctx.beginPath();
    ctx.rect(button.x, button.y, button.width, button.height);
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 5;
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.closePath();

    ctx.shadowColor = 'none';
    ctx.shadowBlur = 0;

    ctx.font = '16px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('START', canvas.width / 2, canvas.height / 2 + 21);
}

function collisionDetection() {
    for(let i in [...Array(settings.cols)]) {
        for(let j in [...Array(settings.rows)]) {
            const brick = bricks[i][j];

            if(brick.health > 0 && x > brick.x && x < brick.x + settings.width && y > brick.y && y < brick.y + settings.height) {
                dy = -dy;
                brick.health--;
                score++;

                if(bricks.filter(e => e.filter(e => e.health > 0).length > 0).length === 0) {
                    level++;

                    if(levels.length === level) {
                        gameOver = true;
                    } else {
                        start();
                        fillBricks();
                    }
                }
            }
        }
    }
}

function getResult() {
    if(level === levels.length && bricks.filter(e => e.filter(e => e.health > 0).length > 0).length === 0) {
        return 'You Win!';
    } else {
        return 'Game Over';
    }
}

function keyDownHandler(e) {
    switch(e.keyCode) {
        case 39:
            rightPressed = true;
            break;
        case 38:
        case 32:
            if(!gameOver && !moveBall) moveBall = true;
            break;
        case 37:
            leftPressed = true;
            break;
    }
}

function keyUpHandler(e) {
    switch(e.keyCode) {
        case 39:
            rightPressed = false;
            break;
        case 37:
            leftPressed = false;
            break;
    }
}

function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) paddleX = relativeX - paddleWidth / 2;
}