(() => {
    const cashBuyIn = document.getElementById("cash-buy-in");
    const chipBuyIn = document.getElementById("chip-buy-in");
    const cashPerChip = document.getElementById("cash-per-chip");
    const addPlayerInput = document.getElementById("add-player-input");
    const addPlayerButton = document.getElementById("add-player-button");
    const activePlayers = document.getElementById("active-players");
    const playersTable = document.getElementById("players");

    function main() {
        cashBuyIn.addEventListener("change", updateSetupInputs);
        chipBuyIn.addEventListener("change", updateSetupInputs);
        addPlayerInput.addEventListener("input", updateAddPlayerButton);
        addPlayerButton.addEventListener("click", addPlayer);

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
        const pl = newRow.insertCell(3);

        const buyInsInput = document.createElement("input");
        buyInsInput.value = 1;
        buyInsInput.type = "number";

        const finalChipCountInput = document.createElement("input");
        finalChipCountInput.value = chipBuyIn.valueAsNumber;
        finalChipCountInput.type = "number";

        nameCell.textContent = newPlayer;
        buyInsCell.appendChild(buyInsInput);
        finalChipCountCell.appendChild(finalChipCountInput);
        pl.textContent = "0";

        activePlayers.classList.remove("empty");
        addPlayerInput.value = "";
        addPlayerButton.value = "Add Player";
    }

    main();
})();