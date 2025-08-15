const fullCanvas = document.getElementById('fullChart');
const fullCtx = fullCanvas.getContext('2d');
const refreshBtn = document.getElementById('refresh');
const resetBtn = document.getElementById('reset');
const meta = document.getElementById('meta');

function drawFullGraph(ctx, percentages) {
    const dpr = window.devicePixelRatio || 1;
    const width = fullCanvas.width;
    const height = fullCanvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.scale(dpr, dpr);

    const padLeft = 60;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 60;

    const canvasW = width / dpr;
    const canvasH = height / dpr;
    const plotLeft = padLeft;
    const plotRight = canvasW - padRight;
    const plotTop = padTop;
    const plotBottom = canvasH - padBottom;


    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotLeft, plotTop);
    ctx.lineTo(plotLeft, plotBottom);
    ctx.lineTo(plotRight, plotBottom);
    ctx.stroke();


    ctx.font = '12px system-ui';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'right';
    for (let v = 0; v <= 100; v += 10) {
        const y = plotTop + (1 - v/100) * (plotBottom - plotTop);
        ctx.strokeStyle = '#eee';
        ctx.beginPath();
        ctx.moveTo(plotLeft, y);
        ctx.lineTo(plotRight, y);
        ctx.stroke();
        ctx.fillStyle = '#333';
        ctx.fillText(v + '%', plotLeft - 8, y + 4);
    }

    if (!percentages || percentages.length === 0) {
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('No data to plot', canvasW/2, canvasH/2);
        ctx.restore();
        return;
    }


    const N = percentages.length;
    const plotW = plotRight - plotLeft;
    const stepX = plotW / Math.max(1, N - 1);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0074D9';
    ctx.beginPath();
    percentages.forEach((p, i) => {
        const x = plotLeft + i * stepX;
        const y = plotTop + (1 - p/100) * (plotBottom - plotTop);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = '#0074D9';
    percentages.forEach((p, i) => {
        const x = plotLeft + i * stepX;
        const y = plotTop + (1 - p/100) * (plotBottom - plotTop);
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI*2);
        ctx.fill();
    });

    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.font = '11px system-ui';
    const displayXs = [0];
    if (N > 2) displayXs.push(Math.floor((N-1)/2));
    if (N > 1) displayXs.push(N-1);
    displayXs.forEach(i => {
        const x = plotLeft + i * stepX;
        ctx.fillText((i+1).toString(), x, plotBottom + 18);
    });

    ctx.restore();
}

function renderFull() {
    chrome.storage.local.get(['shortsStats','shortsSummary'], (res) => {
        const stats = res.shortsStats || [];
        const summary = res.shortsSummary || { shortest: null, longest: null };
        const percentages = stats.map(s => s.percentage);

        const targetWidth = Math.min(window.innerWidth - 40, 1200);
        const targetHeight = 480;
        const dpr = window.devicePixelRatio || 1;
        fullCanvas.style.width = targetWidth + 'px';
        fullCanvas.style.height = targetHeight + 'px';
        fullCanvas.width = Math.floor(targetWidth * dpr);
        fullCanvas.height = Math.floor(targetHeight * dpr);

        drawFullGraph(fullCtx, percentages);


        const avg = percentages.length ? (percentages.reduce((a,b)=>a+b,0)/percentages.length).toFixed(1) : '—';
        meta.innerHTML = `Total shorts: ${percentages.length} &nbsp;•&nbsp; Average: ${avg}% &nbsp;•&nbsp; Shortest: ${summary.shortest !== null ? summary.shortest.toFixed(1) + '%' : '—'} &nbsp;•&nbsp; Longest: ${summary.longest !== null ? summary.longest.toFixed(1) + '%' : '—'}`;
    });
}

refreshBtn.addEventListener('click', () => {
    renderFull();
});

resetBtn.addEventListener('click', () => {
    chrome.storage.local.set({ shortsStats: [], shortsSummary: { shortest: 100, longest: 0 } }, () => {
        renderFull();
    });
});

renderFull();
