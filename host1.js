// Import Octokit
import { Octokit } from 'https://cdn.skypack.dev/@octokit/core';

const GITHUB_API_OWNER = 'mathlover24';
const GITHUB_API_REPO = 'my-game';

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
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = '';

    players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.innerHTML = `
            <h3>${player.name} (${player.status})</h3>
            <button onclick="killPlayer(${index})">Kill</button>
            <button onclick="removePlayer(${index})">Remove</button>
        `;
        playerList.appendChild(playerDiv);
    });
}

window.startNewGame = startNewGame;
window.resumeGame = resumeGame;
window.killPlayer = killPlayer;
window.removePlayer = removePlayer;
