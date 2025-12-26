// Get canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Paddle settings
const paddle = {
  width: 120,
  height: 15,
  x: (canvas.width - 120) / 2,
  y: canvas.height - 40,
  speed: 8,
  dx: 0
};

// Ball settings
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 8,
  speed: 5,
  dx: 4,
  dy: -4
};

// Score and lives
let score = 0;
let lives = 3;

// Brick settings
const brick = {
  rows: 5,
  columns: 8,
  width: 80,
  height: 20,
  padding: 10,
  offsetTop: 60,
  offsetLeft: 35
};

// Brick grid
let bricks = [];
for (let r = 0; r < brick.rows; r++) {
  bricks[r] = [];
  for (let c = 0; c < brick.columns; c++) {
    bricks[r][c] = { x: 0, y: 0, visible: true };
  }
}

function resetBricks() {
  for (let r = 0; r < brick.rows; r++) {
    for (let c = 0; c < brick.columns; c++) {
      bricks[r][c].visible = true;
    }
  }
}

function allBricksCleared() {
  for (let r = 0; r < brick.rows; r++) {
    for (let c = 0; c < brick.columns; c++) {
      if (bricks[r][c].visible) {
        return false;
      }
    }
  }
  return true;
}

// Keyboard state
let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
  if (e.key === "ArrowRight" || e.key === "Right") {
    rightPressed = true;
  } else if (e.key === "ArrowLeft" || e.key === "Left") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "ArrowRight" || e.key === "Right") {
    rightPressed = false;
  } else if (e.key === "ArrowLeft" || e.key === "Left") {
    leftPressed = false;
  }
}

// Drawing functions
function drawPaddle() {
  ctx.fillStyle = "#0f9";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = "#f33";
  ctx.fill();
}

function drawBricks() {
  for (let r = 0; r < brick.rows; r++) {
    for (let c = 0; c < brick.columns; c++) {
      const b = bricks[r][c];

      if (b.visible) {
        const brickX = (c * (brick.width + brick.padding)) + brick.offsetLeft;
        const brickY = (r * (brick.height + brick.padding)) + brick.offsetTop;

        b.x = brickX;
        b.y = brickY;

        ctx.fillStyle = "#39f";
        ctx.fillRect(brickX, brickY, brick.width, brick.height);
      }
    }
  }
}

function drawHUD() {
  ctx.font = "20px system-ui";
  ctx.fillStyle = "#fff";

  // Score (left)
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}`, 20, 30);

  // Lives (right)
  ctx.textAlign = "right";
  ctx.fillText(`Lives: ${lives}`, canvas.width - 20, 30);

  // Reset for other drawing
  ctx.textAlign = "left";
}

// Update functions
function updatePaddle() {
  if (rightPressed && paddle.x + paddle.width < canvas.width) {
    paddle.x += paddle.speed;
  } else if (leftPressed && paddle.x > 0) {
    paddle.x -= paddle.speed;
  }
}

function updateBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collisions
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
  }

  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  // Paddle collision
  if (
    ball.y + ball.radius >= paddle.y &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddle.width &&
    ball.dy > 0
  ) {
    ball.dy = -ball.dy;
    const hitPos = ball.x - (paddle.x + paddle.width / 2);
    ball.dx = hitPos * 0.1;
  }

  // Brick collisions
  for (let r = 0; r < brick.rows; r++) {
    for (let c = 0; c < brick.columns; c++) {
      const b = bricks[r][c];

      if (b.visible) {
        if (
    ball.x + ball.radius > b.x &&
    ball.x - ball.radius < b.x + brick.width &&
    ball.y + ball.radius > b.y &&
    ball.y - ball.radius < b.y + brick.height
) {
          const prevX = ball.x - ball.dx;
  const prevY = ball.y - ball.dy; // kept for future use

  const hitFromSide =
    prevX + ball.radius <= b.x ||
    prevX - ball.radius >= b.x + brick.width;

  if (hitFromSide) {
    ball.dx = -ball.dx;
  } else {
    ball.dy = -ball.dy;
  }

          b.visible = false;
          score += 10;

          if (allBricksCleared()) {
            resetBricks();
            resetBall();
          }
        }
      }
    }
  }

  // Bottom (lose a life)
  if (ball.y - ball.radius > canvas.height) {
    lives--;

    if (lives <= 0) {
      // Game over: reset everything
      lives = 3;
      score = 0;
      resetBricks();
    }

    resetBall();
  }
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = 4;
  ball.dy = -4;

  // Center paddle too
  paddle.x = (canvas.width - paddle.width) / 2;
}

// Clear screen
function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Main game loop
function gameLoop() {
  clear();
  drawBricks();
  updatePaddle();
  updateBall();
  drawPaddle();
  drawBall();
  drawHUD();
  requestAnimationFrame(gameLoop);
}

// Start
gameLoop();
