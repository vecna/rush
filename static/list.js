const MAX_ROWS = 65;
const processor = "rilpub";

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#data-table tbody');

    for (let i = 0; i < MAX_ROWS; i++) {
        const row = document.createElement('tr');

        // Number column
        const numberCell = document.createElement('td');
        numberCell.textContent = i;
        row.appendChild(numberCell);

        // Checkbox column
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = localStorage.getItem(`checkbox-${i}`) === 'true';
        checkbox.addEventListener('change', () => {
            localStorage.setItem(`checkbox-${i}`, checkbox.checked);
            console.log(`Row ${i} checkbox ${checkbox.checked ? 'saved' : 'updated'} in localStorage`);
        });
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);

        // Link column
        const linkCell = document.createElement('td');
        const link = document.createElement('a');
        link.href = `/1/content/${i}`;
        link.textContent = `/1/content/${i}`;
        linkCell.appendChild(link);
        row.appendChild(linkCell);

        // Copy JSON column
        const copyCell = document.createElement('td');
        const copyButton = document.createElement('button');
        copyButton.textContent = 'copy now';
        copyButton.addEventListener('click', async () => {
            try {
                const response = await fetch(`/1/content/${i}`);
                const data = await response.json();
                await navigator.clipboard.writeText(JSON.stringify(data));
                copyButton.textContent = 'done!';
            } catch (error) {
                console.error('Failed to copy JSON:', error);
            }
        });
        copyCell.appendChild(copyButton);
        row.appendChild(copyCell);

        // New JSON Paste column
        const jsonPasteCell = document.createElement('td');
        const jsonTextarea = document.createElement('textarea');
        jsonTextarea.addEventListener('input', () => {
            try {
                const jsonData = JSON.parse(jsonTextarea.value);
                if (Array.isArray(jsonData)) {
                    jsonData.forEach((proposedEntry, index) => {
                        console.log(`proposedEntry ${index}:`, Object.keys(proposedEntry));
                    });
                    putButton.style.display = 'inline-block';
                } else {
                    console.error('JSON is not an array of objects');
                }
            } catch (error) {
                console.error('Invalid JSON:', error);
            }
        });
        jsonPasteCell.appendChild(jsonTextarea);
        row.appendChild(jsonPasteCell);

        // New PUT Button column
        const putButtonCell = document.createElement('td');
        const putButton = document.createElement('button');
        putButton.textContent = 'Send PUT';
        putButton.style.display = 'none';
        putButton.addEventListener('click', async () => {
            try {
                const jsonData = JSON.parse(jsonTextarea.value);
                for (const obj of jsonData) {
                    await fetch(`/2/io/${processor}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(obj)
                    });
                }
                putButton.textContent = 'Sent!';
            } catch (error) {
                console.error('Failed to send PUT request:', error);
            }
        });
        putButtonCell.appendChild(putButton);
        row.appendChild(putButtonCell);

        tableBody.appendChild(row);
    }
});
