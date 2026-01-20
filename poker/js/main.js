(() => {
    const cashBuyIn = document.getElementById("cash-buy-in");
    const chipBuyIn = document.getElementById("chip-buy-in");
    const cashPerChip = document.getElementById("cash-per-chip");
    const addPlayerInput = document.getElementById("add-player-input");
    const addPlayerButton = document.getElementById("add-player-button");
    const activePlayers = document.getElementById("active-players");
    const playersTable = document.getElementById("players");
    const calculatePlButton = document.getElementById("calculate-pl");
    const warningText = document.getElementById("warning-text");
    let playerCount = 0;

    function main() {
        cashBuyIn.addEventListener("change", updateSetupInputs);
        chipBuyIn.addEventListener("change", updateSetupInputs);
        addPlayerInput.addEventListener("input", updateAddPlayerButton);
        addPlayerButton.addEventListener("click", addPlayer);
        calculatePlButton.addEventListener("click", calculatePl);

        addPlayerInput.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                addPlayer();
            }
        });
    }

    function updateSetupInputs(event) {
        const srcElement = event.srcElement;
        if (srcElement.value.trim() === "") {
            srcElement.value = 0;
        }

        if (cashBuyIn.valueAsNumber === 0 || chipBuyIn.valueAsNumber === 0) {
            return;
        }

        const chipsPerCashAmount = cashBuyIn.valueAsNumber / chipBuyIn.valueAsNumber;
        cashPerChip.value = chipsPerCashAmount.toFixed(2);
    }

    function updateAddPlayerButton(event) {
        const playerName = event.srcElement.value.trim().toLowerCase();
        const capitalizedPlayerName = playerName.replace(/^./, (c) => c.toUpperCase());
        event.srcElement.value = capitalizedPlayerName;
        addPlayerButton.value = "Add " + capitalizedPlayerName;
    }

    function addPlayer() {
        const newPlayer = addPlayerInput.value;
        if (newPlayer.trim() === "") {
            return;
        }

        const newRow = playersTable.insertRow(-1);
        const nameCell = newRow.insertCell(0);
        const buyInsCell = newRow.insertCell(1);
        const finalChipCountCell = newRow.insertCell(2);
        const pnl = newRow.insertCell(3);

        const playerId = "player-" + playerCount + "-";
        const buyInsInput = document.createElement("input");
        buyInsInput.name = playerId + "buy-ins";
        buyInsInput.value = 1;
        buyInsInput.type = "number";
        buyInsInput.classList.add("skinny-input");

        const finalChipCountInput = document.createElement("input");
        finalChipCountInput.name = playerId + "final-chip-count";
        finalChipCountInput.value = chipBuyIn.valueAsNumber;
        finalChipCountInput.type = "number";
        finalChipCountInput.classList.add("skinny-input");

        nameCell.textContent = newPlayer;
        buyInsCell.appendChild(buyInsInput);
        finalChipCountCell.appendChild(finalChipCountInput);
        pnl.textContent = "$0.00";
        pnl.classList.add("pnl-cell");

        activePlayers.classList.remove("empty");
        addPlayerInput.value = "";
        addPlayerButton.value = "Add Player";
        playerCount += 1;
    }

    function calculatePl(event) {
        let rows = playersTable.rows;
        let totalBuyIns = 0;
        let totalChips = 0;
        for (let r = 0; r < rows.length; r++) {
            let row = rows[r];
            let inputs = row.querySelectorAll("input");
            let playerBuyIns = inputs[0].valueAsNumber;
            let playerFinalChips = inputs[1].valueAsNumber;
            let buyInCash = playerBuyIns * cashBuyIn.valueAsNumber;
            let finalCash = playerFinalChips * cashPerChip.valueAsNumber;

            let pnl = finalCash - buyInCash;
            let pnlCell = row.querySelector(".pnl-cell");
            pnlCell.className = "pnl-cell";
            if (pnl < 0) {
                pnlCell.classList.add("n-ive");
                pnlCell.textContent = "-$" + Math.abs(pnl).toFixed(2);
            } else if (pnl > 0) {
                pnlCell.classList.add("p-ive");
                pnlCell.textContent = "$" + pnl.toFixed(2);
            } else {
                pnlCell.textContent = "$0.00";
            }

            totalBuyIns += playerBuyIns;
            totalChips += playerFinalChips;
        }

        let expectedTotalChips = totalBuyIns * chipBuyIn.valueAsNumber;
        if (expectedTotalChips != totalChips) {
            warningText.textContent = "Warning: Chips don't match buyins."
            + "Total amount is "
            + totalChips
            + " but expected "
            + expectedTotalChips;
        } else {
            warningText.textContent = "";
        }
    }

    main();
})();