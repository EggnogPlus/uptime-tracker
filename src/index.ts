import init, { get_trackers, check_all_ips } from '../uptime-crate/pkg/uptime_crate.js';
interface Tracker {
    url: String;
    history: boolean[];
}

async function updateDashboard() {

    await check_all_ips();

    const trackers: Tracker[] = get_trackers();
    const container = document.getElementById('dashboard');
    if (!container) return;

    container.innerHTML = trackers.map(t => createCard(t)).join('');
}

function createCard(tracker: Tracker): string {
    const currentStatus = tracker.history[tracker.history.length - 1];
    const statusColor = currentStatus ? 'text-green-500' : 'text-red-500';
    const statusText = currentStatus ? 'Online' : 'Offline';

    return `
    <div class="card">
      <div class="card-header">
        <h3>${tracker.url}</h3>
        <span class="status ${statusColor}">${statusText}</span>
      </div>
      <div class="graph-container">
        ${generateSparkline(tracker.history)}
      </div>
      <div class="uptime-percent">
        Uptime: ${calculateUptime(tracker.history)}%
      </div>
    </div>
  `;
}

function generateSparkline(history: boolean[]): string {
    const width = 200;
    const height = 30;
    const step = width / (history.length - 1 || 1);

    // Create points for an SVG Polyline
    // If true (Online), y = 5; if false (Offline), y = 25
    const points = history
        .map((val, i) => `${i * step},${val ? 5 : 25}`)
        .join(' ');

    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <polyline
        fill="none"
        stroke="${history[history.length - 1] ? '#22c55e' : '#ef4444'}"
        stroke-width="2"
        points="${points}"
      />
    </svg>
  `;
}

function calculateUptime(history: boolean[]): string {
    if (history.length === 0) return "0";
    const onlineCount = history.filter(h => h).length;
    return ((onlineCount / history.length) * 100).toFixed(1);
}

init().then(() => {
    updateDashboard();
    setInterval(updateDashboard, 6000); // Update every minute
});
