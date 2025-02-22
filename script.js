document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const resultDiv = document.getElementById('result');
    const loadingBar = document.getElementById('loadingBar');
    const loadingContainer = document.querySelector('.loading-container');

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const allowedExtensions = ['exe', 'zip', 'js', 'bat', 'dll'];
        const fileExt = file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExt)) {
            resultDiv.textContent = '❌ Unsupported file type! Please upload an executable or script file.';
            resultDiv.style.color = 'yellow';
            return;
        }

        resultDiv.textContent = '';
        loadingContainer.style.display = 'block';
        loadingBar.style.width = '0%';

        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            loadingBar.style.width = progress + '%';
            if (progress >= 100) clearInterval(interval);
        }, 400);

        // Compute file hash
        const hash = await computeSHA256(file);

        setTimeout(() => {
            loadingContainer.style.display = 'none';
            const threatLevel = checkThreatLevel(hash);

            if (threatLevel === 'Low') {
                resultDiv.textContent = `✅ File "${file.name}" is safe (Low Risk).`;
                resultDiv.style.color = 'green';
            } else if (threatLevel === 'Medium') {
                resultDiv.textContent = `⚠️ File "${file.name}" may be risky (Medium Risk).`;
                resultDiv.style.color = 'orange';
            } else {
                resultDiv.textContent = `🚨 File "${file.name}" is HIGHLY dangerous! (High Risk)`;
                resultDiv.style.color = 'red';
            }
        }, 2000);
    } else {
        resultDiv.textContent = 'Please select a file to scan.';
        resultDiv.style.color = 'white';
    }
});

// Function to compute SHA-256 hash of the file
async function computeSHA256(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Fake threat database
const fakeThreatDB = {
    'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3': 'High',  // Fake dangerous hash
    '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12': 'Medium' // Fake medium risk hash
};

// Function to check threat level
function checkThreatLevel(hash) {
    return fakeThreatDB[hash] || 'Low';
}
