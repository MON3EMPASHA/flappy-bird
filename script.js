if (!localStorage.getItem("highScore")) {
  localStorage.setItem("highScore", 0);
}
let GameOverModal = document.getElementById("gameovermodal");
// Configuration constants
const CONFIG = {
  boardWidth: 360,
  boardHeight: 640,
  birdWidth: 34,
  birdHeight: 24,
  pipeWidth: 64,
  pipeHeight: 512,
  pipeGap: 180,
  gravity: 0.3,
  jumpPower: 5,
  velocityX: 2,
};

// Game variables
let board, context;
let pipeArray = [];
let gameOver = false;
let score = 0;
let bird;
let pipeInterval;

// Bird class
class Bird {
  constructor(x, y, width, height, imgSrc) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocityY = 0;
    this.img = new Image();
    this.img.src = imgSrc;
  }

  draw() {
    context.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  update() {
    this.velocityY += CONFIG.gravity;
    this.y = Math.max(this.y + this.velocityY, 0);
    if (this.y > CONFIG.boardHeight) {
      gameOver = true;
    }
  }

  jump() {
    this.velocityY = -CONFIG.jumpPower;
  }
}

// Pipe class
class Pipe {
  constructor(x, y, width, height, imgSrc) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.img = new Image();
    this.img.src = imgSrc;
    this.passed = false;
  }

  draw() {
    context.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  update() {
    this.x -= CONFIG.velocityX;
  }
}

// Game initialization
function InitializeGame() {
  board = document.getElementById("board");
  board.width = CONFIG.boardWidth;
  board.height = CONFIG.boardHeight;
  context = board.getContext("2d");

  bird = new Bird(
    CONFIG.boardWidth / 8, //x
    CONFIG.boardHeight / 2, //y
    CONFIG.birdWidth, //w
    CONFIG.birdHeight, //h
    "./imgs/flappybird.png" //img src
  );

  topPipeImg = "./imgs/toppipe.png";
  bottomPipeImg = "./imgs/bottompipe.png";
  // Clear any previous pipes and interval
  clearInterval(pipeInterval);
  pipeArray = [];
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      bird.jump();
    }
  });
  document.addEventListener("touchstart", (e) => {
    bird.jump();
  });

  document.addEventListener("click", (e) => {
    bird.jump();
  });
  pipeInterval = setInterval(placePipes, 1500);

  requestAnimationFrame(DrawScene);
}

// Pipe placement
function placePipes() {
  if (gameOver) return;

  let randomPipeY =
    -CONFIG.pipeHeight / 4 - Math.random() * (CONFIG.pipeHeight / 2);
  let openingSpace = CONFIG.boardHeight / 4;

  pipeArray.push(
    //top pipe
    new Pipe(
      CONFIG.boardWidth,
      randomPipeY,
      CONFIG.pipeWidth,
      CONFIG.pipeHeight,
      topPipeImg
    )
  );
  pipeArray.push(
    //low pipe
    new Pipe(
      CONFIG.boardWidth,
      randomPipeY + CONFIG.pipeHeight + openingSpace,
      CONFIG.pipeWidth,
      CONFIG.pipeHeight,
      bottomPipeImg
    )
  );
}

// Collision detection
function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Game loop
function DrawScene() {
  if (gameOver) {
    GameOver();
    return;
  }
  context.clearRect(0, 0, CONFIG.boardWidth, CONFIG.boardHeight);

  bird.update();
  bird.draw();

  pipeArray.forEach((pipe, index) => {
    pipe.update();
    pipe.draw();

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      pipe.passed = true;
      score += 0.5;
    }

    if (detectCollision(bird, pipe)) {
      gameOver = true;
    }

    if (pipe.x + pipe.width < 0) {
      pipeArray.splice(index, 1);
    }
  });

  // Draw score
  context.fillStyle = "white";
  context.font = "25px Arial";
  context.fillText("Score: " + score, 10, 30);

  // Draw High score
  context.fillStyle = "white";
  context.font = "20px Arial";
  context.fillText("High Score: " + localStorage.getItem("highScore"), 230, 30);
  requestAnimationFrame(DrawScene);
}

function GameOver() {
  let highscore = false;
  if (score > localStorage.getItem("highScore")) {
    localStorage.setItem("highScore", score);
    highscore = true;
  }
  // console.log("Game Over");
  clearInterval(pipeInterval);
  GameOverModal.style.display = "block";
  GameOverModal.style.width = "200px";
  GameOverModal.style.backgroundColor = "lightblue";
  GameOverModal.style.padding = "10px";
  GameOverModal.style.color = "white";

  if (GameOverModal) {
    let text;
    if (highscore && score == localStorage.getItem("highScore") && score != 0) {
      text = `Congratulations!<br></br> New High Score! ${score}`;
    } else {
      text = "Game Over";
    }

    GameOverModal.innerHTML = `<h3>${text} </h3><button id="playAgainBtn">Play Again</button>`;
    let PABtn = document.getElementById("playAgainBtn");
    PABtn.addEventListener("click", () => {
      gameOver = false;
      score = 0;
      pipeArray = [];
      bird.velocityY = 0;
      GameOverModal.innerHTML = "";
      GameOverModal.style.display = "none";

      InitializeGame();
    });
  }
}
// Start the game
window.onload = InitializeGame;
