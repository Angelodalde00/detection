document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const resultDiv = document.getElementById('result');
    const loadingBar = document.getElementById('loadingBar');
    const loadingContainer = document.querySelector('.loading-container');

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const allowedExtensions = ['pdf', 'docx'];
        const fileExt = file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExt)) {
            resultDiv.textContent = '❌ Unsupported file type! Please upload a PDF or Word document.';
            resultDiv.style.color = 'red';
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

        // Extract text content and scan
        let fileText = await extractText(file);
        let threatLevel = scanForThreats(fileText);

        setTimeout(() => {
            loadingContainer.style.display = 'none';

            if (threatLevel === 'Low') {
                resultDiv.textContent = `✅ File "${file.name}" is safe (Low Risk).`;
                resultDiv.style.color = 'green';
            } else if (threatLevel === 'Medium') {
                resultDiv.textContent = `⚠️ File "${file.name}" may contain suspicious content (Medium Risk).`;
                resultDiv.style.color = 'orange';
            } else {
                resultDiv.textContent = `🚨 File "${file.name}" contains HIGHLY suspicious content (High Risk)!`;
                resultDiv.style.color = 'red';
            }
        }, 2000);
    } else {
        resultDiv.textContent = 'Please select a file to scan.';
        resultDiv.style.color = 'black';
    }
});

// Function to extract text from PDF or DOCX
async function extractText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(event) {
            const fileContent = event.target.result;
            resolve(fileContent.toLowerCase());  // Convert to lowercase for case-insensitive scanning
        };

        reader.onerror = function() {
            reject("Error reading file");
        };

        reader.readAsText(file);
    });
}

// Function to check for suspicious keywords
function scanForThreats(text) {
    const highRiskKeywords = ['trojan', 'malware', 'keylogger', 'ransomware'];
    const mediumRiskKeywords = ['phishing', 'spyware', 'data breach', 'hacker'];

    let highRiskCount = highRiskKeywords.filter(word => text.includes(word)).length;
    let mediumRiskCount = mediumRiskKeywords.filter(word => text.includes(word)).length;

    if (highRiskCount > 0) return 'High';
    if (mediumRiskCount > 0) return 'Medium';
    return 'Low';
}
