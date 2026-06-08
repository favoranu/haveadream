(function () {
  const canvas = document.getElementById('tokenomics-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  const data = {
    labels: ['Team & Founder', 'Treasury', 'Airdrop', 'Ecosystem Incentives'],
    datasets: [{
      data: [19, 39.51, 22.2, 19.29],
      backgroundColor: ['#FFD700', '#00BFFF', '#FF69B4', '#32CD32'],
      borderColor: '#02183D',
      borderWidth: 3,
      hoverOffset: 12
    }]
  };

  canvas.closest('.chart-canvas-wrap')?.classList.add('chart-ready');

  new Chart(canvas, {
    type: 'pie',
    data,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#E8FDFE', font: { family: 'Inter', size: 13 }, padding: 16 }
        },
        title: {
          display: true,
          text: '$HAD Token Allocation (10B Total Supply)',
          color: '#FFFFFF',
          font: { family: 'Playfair Display', size: 16, weight: 'bold' },
          padding: { bottom: 20 }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const amt = (ctx.parsed * 100_000_000).toLocaleString();
              return ` ${ctx.label}: ${ctx.parsed}% (${amt} HAD)`;
            }
          }
        }
      }
    }
  });
})();