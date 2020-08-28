const gameScreen = document.getElementById("gameScreen");
const ctx = gameScreen.getContext("2d");
let homePage = document.getElementsByClassName("clear");
let levels = document.getElementsByClassName("level");
homePage = Object.values(homePage);
levels = Object.values(levels);

let time,
    allSnake,
    myApple,
    gameOn,
    dircetion,
    xSnake,
    ySnake,
    lastTimeSnake,
    snakeEat,
    obesity,
    newObesity,
    score,
    mySpeciel,
    specielText,
    lastScoreSpeciel,
    level,
    win,
    winner,
    levelOpen;

const speed = {
    snake: 10,
    global: 1,
};

function setUpLevel(lev) {
    setUpOpen();
    switch (lev) {
        case 1:
            setUpVariables(1);
            break;

        case 2:
            if (levelOpen.two === "open") {
                setUpVariables(2);
                break;
            }

        case 3:
            if (levelOpen.three === "open") {
                setUpVariables(3);
                break;
            }

        case 4:
            if (levelOpen.four === "open") {
                setUpVariables(4);
                break;
            }

        case 5:
            if (levelOpen.five === "open") {
                setUpVariables(5);
                break;
            }

        case 6:
            if (levelOpen.six === "open") {
                setUpVariables(6);
                break;
            }

        case 7:
            if (levelOpen.seven === "open") {
                setUpVariables(7);
                break;
            }

        case 8:
            if (levelOpen.eight === "open") {
                setUpVariables(8);
                break;
            }

        case 9:
            if (levelOpen.nine === "open") {
                setUpVariables(9);
                break;
            }

        default:
            alert(
                "You have to finish all the levels up to here before you play that level!" // confirm
            );
            break;
    }
}

function setUpOpen() {
    levelOpen = {
        two: localStorage.getItem("goodSnake.level.open.2"),
        three: localStorage.getItem("goodSnake.level.open.3"),
        four: localStorage.getItem("goodSnake.level.open.4"),
        five: localStorage.getItem("goodSnake.level.open.5"),
        six: localStorage.getItem("goodSnake.level.open.6"),
        seven: localStorage.getItem("goodSnake.level.open.7"),
        eight: localStorage.getItem("goodSnake.level.open.8"),
        nine: localStorage.getItem("goodSnake.level.open.9"),
    };
}

function setUpVariables(lev) {
    newObesity = Math.floor(lev * 2.5);
    speed.snake = 30 - lev * 3;
    win = 30;
    level = lev;
    clearHomePage();
    setUpGame();
}

function clearHomePage() {
    homePage.forEach((oneElement) => {
        oneElement.style.display = "none";
    });
}

//#region $The Game
gameScreen.width = window.innerWidth - 36;
gameScreen.height = window.innerHeight - 32;

//#region $Image
const appleImg = new Image();
appleImg.src =
    "https://html5.gamedistribution.com/rvvASMiM/40caa9898a864a95a5bbbf4b7d0a8484/images/apple.png";
//#endregion

//#region $Audio
const backgroundAudio = new Audio();
backgroundAudio.src = "audio/background.mp3";

const endLevelAudio = new Audio();
endLevelAudio.src = "audio/end game.mp3";

const loseAudio = new Audio();
loseAudio.src = "audio/lose.mp3";

const eatAudio = new Audio();
eatAudio.src = "audio/Apple Crunch.mp3";

const specielAudio = new Audio();
specielAudio.src = "audio/speciel.mp3";
//#endregion

const screen = {
    w: gameScreen.width,
    h: gameScreen.height,
};

const cube = {
    w: gameScreen.width / 50 - 1, // => 29 + 1
    h: gameScreen.height / 23 - 1, // => 30 - 1
};

const timeOut = {};

const snakeStats = Object.freeze({ right: 1, left: 2, up: 3, down: 4 });

class Snake {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    draw() {
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.stroke();
    }
}

class Apple {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    draw() {
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.stroke();
        // ctx.drawImage(appleImg, this.x, this.y, this.w, this.h);
    }

    eat() {
        eatAudio.play();
        clearTimeout(timeOut.eatBackground);
        gameScreen.style.background = "green";
        let eatBackground = setTimeout(() => {
            gameScreen.style.background = "black";
        }, 250);
        timeOut.eatBackground = eatBackground;
        snakeEat = true;
        obesity += newObesity;
        newApple();
    }
}

class Speciel {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = cube.w;
        this.h = cube.h;
    }

    draw() {
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.stroke();
    }

    get() {
        specielAudio.play();
        clearTimeout(timeOut.eatSpecielBackground);
        gameScreen.style.background = "orange";
        let eatSpecielBackground = setTimeout(() => {
            gameScreen.style.background = "black";
        }, 250);
        timeOut.eatSpecielBackground = eatSpecielBackground;
        mySpeciel = null;
        doSpeciel();
    }
}

function setUpGame() {
    gameScreen.style.display = "flex";
    gameOn = true;
    state = snakeStats.right;
    allSnake = [];
    time = 0;
    lastTimeSnake = 0;
    dircetion = snakeStats.right;
    snakeEat = false;
    obesity = 0;
    score = 0;
    lastScoreSpeciel = 0;
    mySpeciel = null;
    specielText = "";

    newApple();

    setUpSnake();
    setStats();

    mainLoop();
}

function setUpSnake() {
    allSnake.push(new Snake(0, 0, cube.w, cube.h));
    for (let i = 0; i < 2; i++) {
        allSnake.push(
            new Snake(
                allSnake[allSnake.length - 1].x + cube.w + 1,
                allSnake[allSnake.length - 1].y,
                cube.w,
                cube.h,
                "red"
            )
        );
    }
    xSnake = allSnake[allSnake.length - 1].x;
    ySnake = allSnake[allSnake.length - 1].y;
}

function setStats() {
    document.addEventListener("keydown", (event) => {
        switch (event.keyCode) {
            case 38:
                if (dircetion !== snakeStats.down) {
                    dircetion = snakeStats.up;
                }
                break;

            case 40:
                if (dircetion !== snakeStats.up) {
                    dircetion = snakeStats.down;
                }
                break;

            case 37:
                if (dircetion !== snakeStats.right) {
                    dircetion = snakeStats.left;
                }
                break;

            case 39:
                if (dircetion !== snakeStats.left) {
                    dircetion = snakeStats.right;
                }
                break;
        }
    });
}

function mainLoop() {
    backgroundAudio.volume = 0.05;
    backgroundAudio.play();

    checkEat();
    updateSnakeLocetion();
    newSpeciel();
    checkEatSpeciel();
    draw();

    winner = checkWin();
    gameOn = !checkLose();

    if (winner) {
        endLevel();
    } else if (gameOn) {
        setTimeout(mainLoop, speed.global);
    } else {
        lose();
    }
    time++;
}

function newApple() {
    let pushApple = true;
    let x = Math.floor(Math.random() * screen.w);
    let y = Math.floor(Math.random() * screen.h);
    x = x - (x % (cube.w + 1));
    y = y - (y % (cube.h + 1));
    allSnake.forEach((oneSnake) => {
        if (oneSnake.x === x && oneSnake.y === y) {
            pushApple = false;
        }
    });
    if (y < 0 || y + cube.h > screen.h || x < 0 || x + cube.w > screen.w) {
        pushApple = false;
    }
    if (pushApple) {
        myApple = new Apple(x, y, cube.w, cube.h);
    } else {
        newApple();
    }
}

function checkEat() {
    if (xSnake === myApple.x && ySnake === myApple.y) {
        setScore();
        myApple.eat();
    }
}

function setScore() {
    score++;
}

function updateSnakeLocetion() {
    if (time - lastTimeSnake > speed.snake) {
        setNewSnake();
        lastTimeSnake = time;
    }
}

function newSpeciel() {
    if (mySpeciel === null && lastScoreSpeciel !== score) {
        let newS = Math.floor(Math.random() * 700);
        if (newS === 10) {
            newS = true;
            let x = Math.floor(Math.random() * screen.w);
            let y = Math.floor(Math.random() * screen.h);
            x = x - (x % (cube.w + 1));
            y = y - (y % (cube.h + 1));
            allSnake.forEach((oneSnake) => {
                if (oneSnake.x === x && oneSnake.y === y) {
                    newS = false;
                }
            });
            if (
                y < 0 ||
                y + cube.h > screen.h ||
                x < 0 ||
                x + cube.w > screen.w
            ) {
                newS = false;
            }
            if (newS) {
                mySpeciel = new Speciel(x, y);
            }
        }
    }
}

function checkEatSpeciel() {
    if (
        mySpeciel !== null &&
        xSnake === mySpeciel.x &&
        ySnake === mySpeciel.y
    ) {
        mySpeciel.get();
    }
}

function doSpeciel() {
    clearTimeout(timeOut.speciel);
    let type = Math.floor(Math.random() * 6);
    let s = 3;
    switch (type) {
        case 0:
            score += 2;
            specielText = "+2";
            break;

        case 1:
            speed.snake /= 2;
            setTimeout(() => {
                speed.snake *= 2;
            }, 3000);
            specielText = "fast";
            break;

        case 2:
            let len = Math.floor(allSnake.length / 3);
            for (let i = 0; i < len; i++) {
                allSnake.shift();
            }
            specielText = "diet";
            break;

        case 3:
            score += 5;
            specielText = "+5";
            break;

        case 4:
            newObesity *= 3;
            setTimeout(() => {
                newObesity /= 3;
            }, 10000);
            specielText = "kings meal";
            break;

        case 5:
            s = 60;
            specielText = "this text is annoying, no?";
            break;
    }

    timeOut.speciel = clearSpecielText(s);
    lastScoreSpeciel = score;
}

function clearSpecielText(s) {
    s = s * 1000;
    setTimeout(() => {
        specielText = "";
    }, s);
}

function setNewSnake() {
    switch (dircetion) {
        case snakeStats.up:
            xSnake = xSnake;
            ySnake -= cube.h + 1;
            if (ySnake < 0) {
                ySnake = screen.h - cube.h - 1;
            }
            break;

        case snakeStats.down:
            xSnake = xSnake;
            ySnake += cube.h + 1;
            if (ySnake > screen.h) {
                ySnake = 0;
            }
            break;

        case snakeStats.right:
            xSnake += cube.w + 1;
            ySnake = ySnake;
            if (xSnake > screen.w) {
                xSnake = 0;
            }
            break;

        case snakeStats.left:
            xSnake -= cube.w + 1;
            ySnake = ySnake;
            if (xSnake < 0) {
                xSnake = screen.w - cube.w - 1;
            }
            break;
    }

    if (snakeEat === false) {
        allSnake.shift();
    }
    if (snakeEat === true) {
        obesity--;
        if (obesity <= 0) {
            snakeEat = false;
        }
    }
    allSnake.push(new Snake(xSnake, ySnake, cube.w, cube.h));
    // console.log('x = ', xSnake % 30, 'y = ', ySnake % 30)
}

function draw() {
    ctx.beginPath();
    ctx.clearRect(0, 0, screen.w, screen.h);

    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    allSnake.forEach((oneSnake) => {
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 1;
        if (oneSnake === allSnake[allSnake.length - 1]) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.fillStyle = "red";
        }
        oneSnake.draw();
    });

    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "green";
    myApple.draw();

    if (mySpeciel !== null) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";
        ctx.fillStyle = "orange";
        mySpeciel.draw();
    }

    ctx.font = "40px Luckiest Guy "; // Luckiest Guy, Shojumaru
    ctx.fillStyle = "green";
    ctx.fillText(`score: ${score}/${win}`, 130, 30);

    ctx.font = "100px Slackey"; // Luckiest Guy, Shojumaru, Slackey
    ctx.fillStyle = "orange";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(specielText, screen.w / 2, screen.h / 2 - 100);

    // ctx.fillStyle = 'yellow';
    // ctx.fillRect(150, 10, 30, 30);
}

function checkLose() {
    for (let i = 0; i < allSnake.length - 1; i++) {
        let oneSnake = allSnake[i];
        if (oneSnake.x === xSnake && oneSnake.y === ySnake) {
            ctx.fillStyle = "white";
            ctx.fillRect(oneSnake.x, oneSnake.y, oneSnake.w, oneSnake.h);
            setTimeout(() => {
                ctx.fillStyle = "red";
                ctx.fillRect(oneSnake.x, oneSnake.y, oneSnake.w, oneSnake.h);
            }, 500);
            return true;
        }
    }
    return false;
}

function lose() {
    loseAudio.play();
    gameScreen.style.background = "red";
    setTimeout(() => {
        gameScreen.style.background = "black";
    }, 250);
    setTimeout(backButton, 1500);
}

function checkWin() {
    if (score >= win) {
        return true;
    }
}

function endLevel() {
    endLevelAudio.play();
    level++;
    let pushOpen = localStorage.getItem(`goodSnake.level.open.${level}`);
    if (pushOpen !== "open") {
        localStorage.setItem(`goodSnake.level.open.${level}`, "open");
    }
    setTimeout(backButton, 1500);
}

function backButton() {
    ctx.fillStyle = "green";
    ctx.fillRect(screen.w / 2 - 300, screen.h / 2 - 100, 600, 200);
    ctx.fillStyle = "black";
    ctx.font = "150px Luckiest Guy";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("back", screen.w / 2, screen.h / 2);
    document.addEventListener("click", (event) => {
        if (winner === true || gameOn === false) {
            let xClick = event.pageX - gameScreen.offsetLeft;
            let yClick = event.pageY - gameScreen.offsetTop;
            if (
                xClick < screen.w / 2 + 300 &&
                xClick > screen.w / 2 - 300 &&
                yClick < screen.h / 2 + 100 &&
                yClick > screen.h / 2 - 100
            ) {
            }
            clearGame();
        }
    });
}

function clearGame() {
    homePage.forEach((oneElement) => {
        oneElement.style.display = "flex";
    });
    levels.forEach((oneLevel) => {
        oneLevel.style.display = "inline-block";
    });
    gameScreen.style.display = "none";
}
//#endregion
