const CPU_MAX_POINTS = 30;
const RAM_MAX_POINTS = 30;
let cpuData = [];
let ramData = [];
let labels = [];

const cpuCtx = document.getElementById('cpuChart').getContext('2d');
const ramCtx = document.getElementById('ramChart').getContext('2d');

const cpuChart = new Chart(cpuCtx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'CPU %',
            data: cpuData,
            fill: false,
        }]
    },
    options: {
        animation: false,
        scales: {
            y: { beginAtZero: true, max: 100 }
        }
    }
});

const ramChart = new Chart(ramCtx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'RAM %',
            data: ramData,
            fill: false,
        }]
    },
    options: {
        animation: false,
        scales: {
            y: { beginAtZero: true, max: 100 }
        }
    }
});

let lastNet = null;

async function fetchStats() {
    try {
        const res = await fetch('http://localhost:5000/api/stats');
        const data = await res.json();
        const ts = new Date(data.timestamp).toLocaleTimeString();

        // Update text
        document.getElementById('cpuText').innerText = data.cpu_percent.toFixed(1) + ' %';
        document.getElementById('ramText').innerText = data.ram_used + ' MB / ' + data.ram_total + ' MB';
        document.getElementById('diskText').innerText = data.disk_percent.toFixed(1) + ' %';

        // Network calculation
        if (lastNet) {
            const sentDiff = (data.net_sent - lastNet.sent) / 1024; // KB
            const recvDiff = (data.net_recv - lastNet.recv) / 1024;
            document.getElementById('netText').innerText = `↑ ${sentDiff.toFixed(1)} KB  ↓ ${recvDiff.toFixed(1)} KB`;
        }
        lastNet = { sent: data.net_sent, recv: data.net_recv };

        // Update arrays
        labels.push(ts);
        cpuData.push(data.cpu_percent);
        ramData.push(data.ram_percent);

        if (labels.length > CPU_MAX_POINTS) {
            labels.shift();
            cpuData.shift();
            ramData.shift();
        }

        cpuChart.update();
        ramChart.update();
    } catch (err) {
        console.error('Failed to fetch stats', err);
    }
}

// Fetch every 2 seconds
fetchStats();
setInterval(fetchStats, 2000);