function createChart(chartId, label, data) {
    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1 day ago', '2 days ago', '3 days ago', '4 days ago', '5 days ago'],
            datasets: [{
                label: label,
                data: data,
                borderColor: 'blue',
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

async function updateStockData(stockId, priceElementId, relatedElementId, chartId) {
    try {
        const response = await fetch(`https://sinhwajejagso.github.io/miju/${stockId}`);
        const data = await response.json();
        
        document.getElementById(priceElementId).textContent = `$${data.price?.toFixed(2) || 'N/A'}`;

        const relatedBody = document.getElementById(relatedElementId);
        relatedBody.innerHTML = '';
        data.related.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.type}</td>
                <td>$${item.price?.toFixed(2) || 'N/A'}</td>
                <td>${item.volume?.toLocaleString() || 'N/A'}</td>
                <td>${item.volumeChange || 'N/A'}</td>
            `;
            relatedBody.appendChild(row);
        });

        if (data.chartData && data.chartData.length >= 5) {
            createChart(chartId, `${stockId.toUpperCase()} Stock Price`, data.chartData);
        } else {
            document.getElementById(chartId).innerText = 'Insufficient data for chart';
        }
    } catch (error) {
        console.error(`Error fetching ${stockId} data:`, error);
    }
}

window.onload = () => {
    updateStockData('tsla', 'tsla-price', 'tsla-related', 'tsla-chart');
    updateStockData('nvda', 'nvda-price', 'nvda-related', 'nvda-chart');
    updateStockData('pltr', 'pltr-price', 'pltr-related', 'pltr-chart');

    setInterval(() => {
        updateStockData('tsla', 'tsla-price', 'tsla-related', 'tsla-chart');
        updateStockData('nvda', 'nvda-price', 'nvda-related', 'nvda-chart');
        updateStockData('pltr', 'pltr-price', 'pltr-related', 'pltr-chart');
    }, 60000);
};
