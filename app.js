
const gameContainer = document.getElementsByClassName('game-container')[0];
const animationContainer = document.getElementsByClassName('animation-container')[0];
const animationNumberElement = document.getElementsByClassName('animation-number')[0];

const slotAudio = new Audio("sounds/slot_cut.mp3");
const slotEndAudio = new Audio("sounds/slot_end.mp3");

const animationFrameTime = 110;
let animationCount = 0;
let isDrawing = false;

document.addEventListener("keydown", (event) => {
    if (event.isComposing || event.keyCode === 229) {
        return;
    }

    if (event.code === "Space" || event.code === "Enter") {
        drawCoinAnimated();
    }
    else if (event.code === "KeyD") {
        drawCoin();
    }
    else if (event.code === "KeyR") {
        if (isDrawing) {
            animationCount = Number.MAX_SAFE_INTEGER;
            slotAudio.pause();
            slotAudio.currentTime = 0;
            slotEndAudio.play();
        }
        else {
            const isConfirm = confirm("Are you sure you want to reset?");

            if (isConfirm) {
                const isConfirmToNot = confirm("Do you not want to reset?");

                if (!isConfirmToNot) {
                    reset();
                }
            }
        }
    }
    else if (event.code === "ArrowLeft") {
        navigate(false);
    }
    else if (event.code === "ArrowRight") {
        navigate(true);
    }
});

let drawnCoinHistory = [];
let historyIndex = 0;
let coinElements = [];

initialize();

function initialize() {
    for (let i = 0; i < 90; i++) {
        const coinContainer = document.createElement("div");
        coinContainer.classList.add("coin-container");

        const coin = document.createElement("div");
        coin.classList.add("coin");

        const coinText = document.createElement("div");
        coinText.classList.add("coin-text");

        coinText.append(String(i + 1));

        coin.appendChild(coinText);
        coinContainer.appendChild(coin);

        coinElements.push(coinContainer);
        gameContainer.appendChild(coinContainer);
    }

    getFromStorageOrDefault();
}

function navigate(isForward) {
    if (isDrawing) {
        return;
    }

    if (isForward) {
        const newHistoryIndex = historyIndex + 1;

        if (newHistoryIndex < drawnCoinHistory.length) {
            historyIndex = newHistoryIndex;
        }
    } else {
        const newHistoryIndex = historyIndex - 1;

        if (newHistoryIndex >= 0) {
            historyIndex = newHistoryIndex;
        }
    }

    updateDrawnCoins();
}

function getFromStorageOrDefault() {
    const storageDrawnCoinHistory = JSON.parse(localStorage.getItem("drawnCoinHistory"));

    if (storageDrawnCoinHistory) {
        drawnCoinHistory = storageDrawnCoinHistory;
        historyIndex = storageDrawnCoinHistory.length - 1;
    }
    else {
        let defaultDrawnCoinHistory = [];
        let defaultDrawnCoins = [];

        for (let i = 0; i < 90; i++) {
            defaultDrawnCoins.push(false);
        }

        defaultDrawnCoinHistory.push(defaultDrawnCoins);
        drawnCoinHistory = defaultDrawnCoinHistory;
        historyIndex = 0;
    }

    updateDrawnCoins();
}

function setStorage() {
    localStorage.setItem("drawnCoinHistory", JSON.stringify(drawnCoinHistory));
}

function reset() {
    localStorage.clear();
    getFromStorageOrDefault();

    // Stop animation
    isDrawing = false;
}

function drawCoin() {
    if (isDrawing) {
        return;
    }

    let drawnCoins = drawnCoinHistory[historyIndex];
    let nextDrawnCoins = [];
    let freeIndexes = [];

    for (let i = 0; i < 90; i++) {
        nextDrawnCoins.push(drawnCoins[i]);

        if (!drawnCoins[i]) {
            freeIndexes.push(i);
        }
    }

    if (freeIndexes.length === 0) {
        return;
    }

    const chosenFreeIndex = getRandomInt(freeIndexes.length);
    const chosenIndex = freeIndexes[chosenFreeIndex];
    nextDrawnCoins[chosenIndex] = true;

    drawnCoinHistory.push(nextDrawnCoins);
    historyIndex = drawnCoinHistory.length - 1;
    updateDrawnCoins();
    setStorage();
}

function drawCoinAnimated() {
    if (isDrawing || isFull()) {
        return;
    }

    isDrawing = true;
    slotAudio.play();

    gameContainer.style.display = "none";
    animationContainer.style.display = "flex";
    animationNumberElement.innerText = "";
    animationCount = 0;

    const internvalId = setInterval(() => {
        if (animationCount < 38) {
            if (animationCount > 14) {
                let drawnCoins = drawnCoinHistory[historyIndex];
                let freeIndexes = [];

                for (let i = 0; i < 90; i++) {
                    if (!drawnCoins[i]) {
                        freeIndexes.push(i);
                    }
                }

                if (freeIndexes.length === 0) {
                    return;
                }

                const chosenFreeIndex = getRandomInt(freeIndexes.length);
                const chosenIndex = freeIndexes[chosenFreeIndex];
                const chosenAnimationNumber = chosenIndex + 1;

                animationNumberElement.innerText = String(chosenAnimationNumber);
            }

            animationCount += 1;
        }
        else {
            clearInterval(internvalId);

            let drawnCoins = drawnCoinHistory[historyIndex];
            let nextDrawnCoins = [];
            let freeIndexes = [];

            for (let i = 0; i < 90; i++) {
                nextDrawnCoins.push(drawnCoins[i]);

                if (!drawnCoins[i]) {
                    freeIndexes.push(i);
                }
            }

            if (freeIndexes.length === 0) {
                return;
            }

            const chosenFreeIndex = getRandomInt(freeIndexes.length);
            const chosenIndex = freeIndexes[chosenFreeIndex];
            nextDrawnCoins[chosenIndex] = true;

            const chosenNumber = chosenIndex + 1;

            animationNumberElement.innerText = String(chosenNumber);

            drawnCoinHistory.push(nextDrawnCoins);
            historyIndex = drawnCoinHistory.length - 1;
            updateDrawnCoins();
            setStorage();

            setTimeout(() => {
                gameContainer.style.display = "flex";
                animationContainer.style.display = "none";
                isDrawing = false;
            }, 2500);
        }
    }, animationFrameTime);
}

function isFull() {
    let drawnCoins = drawnCoinHistory[historyIndex];
    let freeIndexes = [];

    for (let i = 0; i < 90; i++) {
        if (!drawnCoins[i]) {
            freeIndexes.push(i);
        }
    }

    return freeIndexes.length === 0;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function updateDrawnCoins() {
    let drawnCoins = drawnCoinHistory[historyIndex];

    for (let i = 0; i < 90; i++) {
        const isDrawn = drawnCoins[i];
        const coinElement = coinElements[i];

        if (isDrawn) {
            coinElement.classList.add("coin-drawn");
        }
        else {
            coinElement.classList.remove("coin-drawn");
        }
    }
}