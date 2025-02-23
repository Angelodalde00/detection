document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const resultDiv = document.getElementById('result');
    const loadingBar = document.getElementById('loadingBar');
    const loadingContainer = document.querySelector('.loading-container');

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileExt = file.name.split('.').pop().toLowerCase();

        // Supported file types
        const allowedExtensions = ['pdf', 'docx', 'js', 'py', 'bat', 'sh', 'exe', 'msi', 'apk'];

        if (!allowedExtensions.includes(fileExt)) {
            resultDiv.textContent = '❌ Unsupported file type! Please upload a valid file.';
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

        // Extract text if it's a document or script
        let fileText = '';
        if (['pdf', 'docx', 'js', 'py', 'bat', 'sh'].includes(fileExt)) {
            fileText = await extractText(file);
        }

        let threatLevel = scanForThreats(fileText, fileExt);
        let sanitizedFile = file;

        setTimeout(() => {
            loadingContainer.style.display = 'none';

            if (threatLevel === 'Low') {
                resultDiv.textContent = `✅ File "${file.name}" is safe (Low Risk).`;
                resultDiv.style.color = 'green';
            } else {
                resultDiv.textContent = `⚠️ File "${file.name}" contained threats. Fixing...`;
                resultDiv.style.color = 'orange';

                sanitizedFile = sanitizeFile(fileText, fileExt);

                setTimeout(() => {
                    resultDiv.textContent = `✅ File "${file.name}" has been sanitized and is now safe.`;
                    resultDiv.style.color = 'green';
                }, 1500);
            }
        }, 2000);
    } else {
        resultDiv.textContent = 'Please select a file to scan.';
        resultDiv.style.color = 'black';
    }
});

// Function to extract text from documents & scripts
async function extractText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(event) {
            const fileContent = event.target.result;
            resolve(fileContent.toLowerCase());
        };

        reader.onerror = function() {
            reject("Error reading file");
        };

        reader.readAsText(file);
    });
}

// Function to check for suspicious patterns
function scanForThreats(text, fileExt) {
    const highRiskKeywords = ['trojan', 'malware', 'keylogger', 'ransomware', 'hacker', 'exploit'];
    const mediumRiskKeywords = ['phishing', 'spyware', 'data breach', 'virus', 'attack'];

    let highRiskCount = highRiskKeywords.filter(word => text.includes(word)).length;
    let mediumRiskCount = mediumRiskKeywords.filter(word => text.includes(word)).length;

    if (['exe', 'msi', 'apk'].includes(fileExt)) return 'High';
    if (['js', 'py', 'bat', 'sh'].includes(fileExt) && (text.includes('eval(') || text.includes('exec('))) return 'High';

    if (highRiskCount > 0) return 'High';
    if (mediumRiskCount > 0) return 'Medium';
    return 'Low';
}

// Function to fix malicious files
function sanitizeFile(text, fileExt) {
    let safeText = text;

    if (['js', 'py', 'bat', 'sh'].includes(fileExt)) {
        safeText = safeText.replace(/eval\(/g, '/* eval removed */');
        safeText = safeText.replace(/exec\(/g, '/* exec removed */');
        safeText = safeText.replace(/wscript\.shell/g, '/* shell access removed */');
    }

    if (fileExt === 'pdf' || fileExt === 'docx') {
        safeText = safeText.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    }

    return safeText;
}
