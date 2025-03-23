function processJson() {
    const input = document.getElementById('jsonInput').value;
    let jsonData;
    try {
        jsonData = JSON.parse(input);
    } catch (e) {
        alert('Invalid JSON');
        return;
    }

    const { name, requested_file_number, posts } = jsonData;
    const results = posts.map(post => ({
        name,
        requested_file_number,
        posts: [post]
    }));

    displayResults(results);
}

function displayResults(results) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '';
    results.forEach((result, index) => {
        const resultDiv = document.createElement('div');
        
        const indexLabel = document.createElement('span');
        indexLabel.innerText = `Result ${index + 1}: `;
        
        const resultText = document.createElement('textarea');
        resultText.value = JSON.stringify(result, null, 2);
        resultText.readOnly = true;
        resultText.rows = 10;
        resultText.cols = 50;

        const copyButton = document.createElement('button');
        copyButton.innerText = 'Copy to Clipboard';
        copyButton.onclick = () => {
            copyToClipboard(resultText.value, copyButton);
        };

        resultDiv.appendChild(indexLabel);
        resultDiv.appendChild(resultText);
        resultDiv.appendChild(copyButton);
        outputDiv.appendChild(resultDiv);
    });
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        button.style.backgroundColor = 'darkgreen';
        button.innerText = 'Copied!';
    }).catch(err => {
        alert('Failed to copy: ' + err);
    });
}
