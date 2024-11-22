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

// Declare global variable for players
let players = [];


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
            renderPlayerList();  // Call the function to render the player list

            document.getElementById('game-code-display').textContent = `Game Code: ${gameData.gameCode}`;
            document.getElementById('resume-status').textContent = "Game resumed successfully!";
            document.getElementById('resume-status').style.color = "green";
        } else {
            document.getElementById('resume-status').textContent = "Failed to fetch game data. Game code may be incorrect.";
        }
    } catch (error) {
        console.error('Error fetching game data:', error);
        document.getElementById('resume-status').textContent = "An error occurred. Make sure the game code is correct.";
    }
}

// Function to render the list of players
function renderPlayerList() {
    const playerListContainer = document.getElementById('player-list');

    // Check if the player-list element exists before proceeding
    if (playerListContainer) {
        playerListContainer.innerHTML = ''; // Clear existing list

        if (players.length > 0) {
            players.forEach(player => {
                const playerItem = document.createElement('li');
                playerItem.textContent = player;  // Assuming player is just a name or username
                playerListContainer.appendChild(playerItem);
            });
        } else {
            playerListContainer.textContent = "No players yet.";
        }
    } else {
        console.error('Error: player-list element not found.');
    }
}


// Make `startNewGame` and `resumeGame` accessible in the global scope for HTML onclick usage
window.startNewGame = startNewGame;
window.resumeGame = resumeGame;
