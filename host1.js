// Import Octokit
import { Octokit } from 'https://cdn.skypack.dev/@octokit/core';

const GITHUB_API_URL = 'https://api.github.com/repos/monkeyluigi/senior_assassin/contents/';
const GITHUB_TOKEN_SUFFIX = '1DyloV1tSDJW813AgexIkMVK2YMqqX155bPA';
const GITHUB_TOKEN = "ghp_" + GITHUB_TOKEN_SUFFIX;
const GITHUB_API_OWNER = 'monkeyluigi'; // Replace with your GitHub username
const GITHUB_API_REPO = 'senior_assassin'; // Replace with your repository name

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function startNewGame() {
    const gameCode = Math.floor(Math.random() * 1000000).toString();
    const hostPassword = Math.floor(Math.random() * 1000000).toString();
    const filePath = `${gameCode}.json`;
    const initialData = { gameCode, hostPassword, players: [] };

    const response = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: GITHUB_API_OWNER,
        repo: GITHUB_API_REPO,
        path: filePath,
        message: `Create new game with code ${gameCode}`,
        content: btoa(JSON.stringify(initialData))
    });

    document.getElementById('game-code-display').textContent = `Game Code: ${gameCode}`;
    document.getElementById('host-password-display').textContent = `Password: ${hostPassword}`;
}

async function resumeGame() {
    const gameCode = document.getElementById('resume-game-code').value.trim();
    const hostPassword = document.getElementById('host-game-password').value.trim();

    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: GITHUB_API_OWNER,
        repo: GITHUB_API_REPO,
        path: `${gameCode}.json`
    });

    const gameData = JSON.parse(atob(response.data.content));

    if (gameData.hostPassword !== hostPassword) {
        alert("Incorrect password!");
        return;
    }

    renderPlayerList(gameData.players);
}

async function removePlayer(index) {
    const gameCode = document.getElementById('resume-game-code').value.trim();

    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: GITHUB_API_OWNER,
        repo: GITHUB_API_REPO,
        path: `${gameCode}.json`
    });

    const gameData = JSON.parse(atob(response.data.content));
    gameData.players.splice(index, 1);

    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: GITHUB_API_OWNER,
        repo: GITHUB_API_REPO,
        path: `${gameCode}.json`,
        message: `Remove player at index ${index}`,
        content: btoa(JSON.stringify(gameData)),
        sha: response.data.sha
    });

    renderPlayerList(gameData.players);
}

async function killPlayer(index) {
    const gameCode = document.getElementById('resume-game-code').value.trim();

    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: GITHUB_API_OWNER,
        repo: GITHUB_API_REPO,
        path: `${gameCode}.json`
    });

    const gameData = JSON.parse(atob(response.data.content));
    gameData.players[index].status = "dead";

    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner: GITHUB_API_OWNER,
        repo: GITHUB_API_REPO,
        path: `${gameCode}.json`,
        message: `Kill player at index ${index}`,
        content: btoa(JSON.stringify(gameData)),
        sha: response.data.sha
    });

    renderPlayerList(gameData.players);
}

function renderPlayerList(players) {
    const playerListContainer = document.getElementById('player-list');

    // Clear existing content
    playerListContainer.innerHTML = '';

    // Loop through players and create HTML for each
    players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';

        const playerName = document.createElement('h3');
        playerName.textContent = `Name: ${player.name}`;

        const playerStatus = document.createElement('p');
        playerStatus.textContent = `Status: ${player.status}`;

        const contactInfo = document.createElement('p');
        contactInfo.textContent = `Contact: ${player.contact || "N/A"}`;

        const playerImage = document.createElement('img');
        playerImage.src = player.profilePicture || "placeholder.png"; // Fallback for missing profile picture
        playerImage.alt = `${player.name}'s profile picture`;
        playerImage.style.width = '100px';

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => removePlayer(index);

        const killButton = document.createElement('button');
        killButton.textContent = 'Kill';
        killButton.onclick = () => killPlayer(index);

        // Append everything to the playerDiv
        playerDiv.appendChild(playerImage);
        playerDiv.appendChild(playerName);
        playerDiv.appendChild(playerStatus);
        playerDiv.appendChild(contactInfo);
        playerDiv.appendChild(removeButton);
        playerDiv.appendChild(killButton);

        // Append playerDiv to the container
        playerListContainer.appendChild(playerDiv);
    });
}

window.startNewGame = startNewGame;
window.resumeGame = resumeGame;
window.killPlayer = killPlayer;
window.removePlayer = removePlayer;
