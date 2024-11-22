// FIX THISSSSSS
// Import Octokit (for environments like bundlers or modern browsers)
import { Octokit } from 'https://cdn.skypack.dev/@octokit/core';

// Example script
const GITHUB_API_URL = 'https://api.github.com/repos/monkeyluigi/senior_assassin/contents/';
const GITHUB_TOKEN_NO_PREFIX = "1DyloV1tSDJW813AgexIkMVK2YMqqX155bPA";
const GITHUB_TOKEN = 'ghp_' + GITHUB_TOKEN_NO_PREFIX
const GITHUB_API_OWNER = 'monkeyluigi'; // Replace with your GitHub username
const GITHUB_API_REPO = 'senior_assassin'; // Replace with your repository name

const octokit = new Octokit({
    auth: GITHUB_TOKEN
});

// Function to start a new game
async function startNewGame() {
    const gameCode = Math.floor(Math.random() * 1000000).toString();
    const filePath = `${gameCode}.json`; // Each game gets its own file
    const initialData = {
        gameCode: gameCode,
        players: []
    };

    try {
        // Attempt to create a new game file on GitHub
        const response = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: GITHUB_API_OWNER,
            repo: GITHUB_API_REPO,
            path: filePath,
            message: `Create a new game with code ${gameCode}`,
            committer: {
                name: 'Game Host',
                email: 'kaden.c.clayton@gmail.com'
            },
            content: btoa(JSON.stringify(initialData)),
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (response.status === 201) { // Status 201 indicates successful file creation
            document.getElementById('game-code-display').textContent = `Game Code: ${gameCode}`;
            alert("Game started! Share this code with joiners.");
        } else {
            alert("Failed to create game. Please check your GitHub settings.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred while creating the game.");
    }
}

// Function to render the player list
function renderPlayerList() {
    const playerListElement = document.getElementById('player-list');
    playerListElement.innerHTML = ''; // Clear existing players

    players.forEach((player, index) => {
        const playerItem = document.createElement('li');
        playerItem.className = 'player-item';

        const playerName = document.createElement('span');
        playerName.className = 'player-name';
        playerName.textContent = player.name;

        const killButton = document.createElement('button');
        killButton.className = 'button kill-button';
        killButton.textContent = 'Mark as Killed';
        killButton.onclick = () => markPlayerAsKilled(index);

        const removeButton = document.createElement('button');
        removeButton.className = 'button remove-button';
        removeButton.textContent = 'Remove Player';
        removeButton.onclick = () => removePlayer(index);

        playerItem.appendChild(playerName);
        playerItem.appendChild(killButton);
        playerItem.appendChild(removeButton);

        playerListElement.appendChild(playerItem);
    });
}

// Function to mark a player as killed
function markPlayerAsKilled(index) {
    players[index].killed = true;
    updateGameData();
    renderPlayerList();
}

// Function to remove a player from the game
function removePlayer(index) {
    players.splice(index, 1);
    updateGameData();
    renderPlayerList();
}

// Function to update game data on GitHub
async function updateGameData() {
    const filePath = `${gameCode}.json`;
    const updatedData = {
        gameCode: gameCode,
        players: players
    };

    try {
        const response = await fetch(GITHUB_API_URL + filePath, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update game data',
                content: btoa(JSON.stringify(updatedData))
            })
        });

        if (!response.ok) {
            console.error('Failed to update game data:', response.statusText);
        }
    } catch (error) {
        console.error('Error updating game data:', error);
    }
}

// Function to resume a game by game code
async function resumeGame() {
    const gameCode = document.getElementById('resume-game-code').value.trim();
    const filePath = `${gameCode}.json`;

    if (!gameCode) {
        document.getElementById('resume-status').textContent = "Please enter a valid game code.";
        return;
    }

    try {
        // Fetch the game file from GitHub
        const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: GITHUB_API_OWNER,
            repo: GITHUB_API_REPO,
            path: filePath,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (response.status === 200) {
            const content = atob(response.data.content);
            const gameData = JSON.parse(content);

            // Update the UI with the retrieved game data
            players = gameData.players || [];
            renderPlayerList();

            document.getElementById('game-code-display').textContent = `Game Code: ${gameData.gameCode}`;
            document.getElementById('resume-status').textContent = "Game resumed successfully!";
            document.getElementById('resume-status').style.color = "green";
        } else {
            document.getElementById('resume-status').textContent = "Failed to fetch game data.";
        }
    } catch (error) {
        console.error('Error fetching game data:', error);
        document.getElementById('resume-status').textContent = "An error occurred. Make sure the game code is correct.";
    }
}


// Make `startNewGame` accessible in the global scope for HTML onclick usage
window.startNewGame = startNewGame;
