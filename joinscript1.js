import { Octokit } from 'https://cdn.skypack.dev/@octokit/core';

// GitHub API Configuration
const GITHUB_API_URL = 'https://api.github.com/repos/monkeyluigi/senior_assassin/contents/';
const GITHUB_TOKEN_NO_PREFIX = "1DyloV1tSDJW813AgexIkMVK2YMqqX155bPA";
const GITHUB_TOKEN = 'ghp_' + GITHUB_TOKEN_NO_PREFIX
const GITHUB_API_OWNER = 'monkeyluigi'; // Replace with your GitHub username
const GITHUB_API_REPO = 'senior_assassin'; // Replace with your repository name

const octokit = new Octokit({
    auth: GITHUB_TOKEN
});

async function joinGame() {
    const gameCode = document.getElementById('join-game-code').value.trim();
    const playerName = document.getElementById('player-name').value.trim();
    const contactInfo = document.getElementById('contact-info').value.trim();
    const profilePictureInput = document.getElementById('profile-picture');

    if (!gameCode || !playerName || !profilePictureInput.files.length || !contactInfo) {
        statusElement.textContent = "Please enter game code, name, contact info, and upload a profile picture.";
        return;
    }

    const profilePictureFile = profilePictureInput.files[0];
    const imageUrl = await uploadImageToGitHub(profilePictureFile, `${playerName}_profile.jpg`);

    if (imageUrl) {
        // Fetch the current game data
        const filePath = `${gameCode}.json`;
        try {
            const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: GITHUB_API_OWNER,
                repo: GITHUB_API_REPO,
                path: filePath
            });

            const gameData = JSON.parse(atob(response.data.content));
            const newPlayer = { name: playerName, status: "alive", profilePicture: imageUrl };
            gameData.players.push(newPlayer);

            // Update game data with new player
            const sha = response.data.sha;
            await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                owner: GITHUB_API_OWNER,
                repo: GITHUB_API_REPO,
                path: filePath,
                message: `Add ${playerName} to the game`,
                committer: { name: 'Game Host', email: 'your-email@example.com' },
                content: btoa(JSON.stringify(gameData)),
                sha: sha
            });

            statusElement.textContent = `${playerName} has joined the game!`;
            statusElement.style.color = "green";
        } catch (error) {
            statusElement.textContent = "Failed to join the game.";
            statusElement.style.color = "red";
        }
    } else {
        statusElement.textContent = "Failed to upload image.";
        statusElement.style.color = "red";
    }
}

async function uploadImageToGitHub(imageFile, fileName) {
    const filePath = `images/${fileName}`; // Store in the 'images/' folder
    const base64Content = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]); // Extract base64 content
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
    });

    try {
        // Check if the file already exists by making a GET request to fetch the file
        const getFileResponse = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: GITHUB_API_OWNER,
            repo: GITHUB_API_REPO,
            path: filePath,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        let sha = '';
        if (getFileResponse.status === 200) {
            // File exists, so we need to get the sha for updating
            sha = getFileResponse.data.sha;
        }

        // Upload or update the image file on GitHub
        const response = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: GITHUB_API_OWNER,
            repo: GITHUB_API_REPO,
            path: filePath,
            message: `Upload or update image: ${fileName}`,
            committer: { name: 'Game Host', email: 'your-email@example.com' },
            content: base64Content,
            sha: sha || '', // If SHA exists, use it for updates
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (response.status === 201 || response.status === 200) {
            return `https://raw.githubusercontent.com/${GITHUB_API_OWNER}/${GITHUB_API_REPO}/main/${filePath}`;
        } else {
            throw new Error("Failed to upload the image.");
        }
    } catch (error) {
        console.error("Error uploading image:", error);
        return null;
    }
}


window.joinGame = joinGame;
