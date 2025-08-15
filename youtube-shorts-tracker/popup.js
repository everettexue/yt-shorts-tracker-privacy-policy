const avgVal = document.getElementById('avgVal');
const shortVal = document.getElementById('shortVal');
const longVal = document.getElementById('longVal');
const resetBtn = document.getElementById('reset');
const openFullBtn = document.getElementById('openFull');
const canvas = document.getElementById('miniChart');
const ctx = canvas.getContext('2d');

function drawGraph(ctx, percentages) {

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

 
    const pad = 28 * dpr;
    const left = pad;
    const right = width - 8 * dpr;
    const top = 8 * dpr;
    const bottom = height - pad;


    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 1;
    ctx.font = '11px system-ui';
    ctx.fillStyle = '#333';


    const canvasW = width / dpr;
    const canvasH = height / dpr;
    for (let v = 0; v <= 100; v += 25) {
        const y = top/dpr + ( (canvasH - top/dpr - bottom/dpr) * (1 - v/100) );
        ctx.strokeStyle = '#eee';
        ctx.beginPath();
        ctx.moveTo(left/dpr, y);
        ctx.lineTo((right)/dpr, y);
        ctx.stroke();

        ctx.fillStyle = '#666';
        ctx.fillText(`${v}%`, 2, y + 4);
    }


    if (!percentages || percentages.length === 0) {
        ctx.fillStyle = '#666';
        ctx.fillText('No data to plot', canvasW/2 - 40, canvasH/2);
        ctx.restore();
        return;
    }


    const N = percentages.length;
    const xStart = left/dpr;
    const xEnd = right/dpr;
    const plotW = xEnd - xStart;
    const stepX = plotW / Math.max(1, N - 1);


    const yFor = (p) => {
        const plotH = (bottom - top)/dpr;
        return top/dpr + (1 - p/100) * plotH;
    };

  
    ctx.strokeStyle = '#0074D9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    percentages.forEach((p, i) => {
        const x = xStart + i * stepX;
        const y = yFor(p);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();


    ctx.fillStyle = '#0074D9';
    percentages.forEach((p, i) => {
        const x = xStart + i * stepX;
        const y = yFor(p);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
}

function loadAndRender() {
    chrome.storage.local.get(['shortsStats','shortsSummary'], (res) => {
        console.log('[Popup] Loaded stats:', res);
        const stats = res.shortsStats || [];
        const summary = res.shortsSummary || { shortest: null, longest: null };

        if (stats.length === 0) {
            avgVal.textContent = '—';
            shortVal.textContent = '—';
            longVal.textContent = '—';
            drawGraph(ctx, []);
            return;
        }

        const percentages = stats.map(s => s.percentage);

        const avg = percentages.reduce((a,b) => a + b, 0) / percentages.length;
        avgVal.textContent = `${avg.toFixed(1)}%`;
        shortVal.textContent = summary.shortest !== null ? `${summary.shortest.toFixed(1)}%` : '—';
        longVal.textContent = summary.longest !== null ? `${summary.longest.toFixed(1)}%` : '—';

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(canvas.clientWidth * dpr);
        canvas.height = Math.floor(canvas.clientHeight * dpr);

        drawGraph(ctx, percentages);
    });
}

resetBtn.addEventListener('click', () => {
    console.log('[Popup] Reset button clicked');
    chrome.storage.local.set({ shortsStats: [], shortsSummary: { shortest: 100, longest: 0 } }, () => {
        console.log('[Popup] Stats reset in storage');
        loadAndRender();
    });
});

openFullBtn.addEventListener('click', () => {
    const url = chrome.runtime.getURL('stats.html');
    chrome.tabs.create({ url });
});

loadAndRender();
