/**
 * 4deklas Widget — statische versie voor guidostudio.nl/schooldemo
 *
 * API_BASE instellen via window.SCHOOLFUND_API vóór dit script laden:
 *   <script>window.SCHOOLFUND_API = 'https://jouw-backend.railway.app';</script>
 *   <script src="/schooldemo/widget.js"></script>
 *
 * Zolang de backend lokaal draait: window.SCHOOLFUND_API weglaten → valt terug op localhost:3000
 */
(function () {
  const API_BASE = (window.SCHOOLFUND_API || 'http://localhost:3000').replace(/\/$/, '');

  function formatEuros(centen) {
    return '€' + (centen / 100).toFixed(2).replace('.', ',');
  }

  function pct(collected, goal) {
    return Math.min(100, Math.round((collected / goal) * 100));
  }

  function renderWidget(container, project) {
    const percentage = pct(project.collected_amount, project.goal_amount);
    container.innerHTML = `
      <div class="sf-widget">
        <div class="sf-header">
          <span class="sf-label">Steun onze school</span>
          <h3 class="sf-title">${project.title}</h3>
          <p class="sf-desc">${project.description || ''}</p>
        </div>
        <div class="sf-meter">
          <div class="sf-bar-track">
            <div class="sf-bar-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="sf-amounts">
            <span class="sf-collected">${formatEuros(project.collected_amount)} opgehaald</span>
            <span class="sf-goal">doel: ${formatEuros(project.goal_amount)}</span>
          </div>
          <div class="sf-pct">${percentage}%</div>
        </div>
        <div class="sf-form" id="sf-form-${project.id}">
          <div class="sf-amounts-choice">
            <button class="sf-amount-btn" data-amount="5">€5</button>
            <button class="sf-amount-btn" data-amount="10">€10</button>
            <button class="sf-amount-btn" data-amount="25">€25</button>
            <button class="sf-amount-btn" data-amount="50">€50</button>
          </div>
          <input class="sf-custom-amount" type="number" placeholder="Eigen bedrag (€)" min="1" />
          <input class="sf-name" type="text" placeholder="Uw naam (optioneel)" />
          <input class="sf-message" type="text" placeholder="Berichtje (optioneel)" />
          <button class="sf-donate-btn">Doneer via iDEAL</button>
          <p class="sf-disclaimer">2% platformvergoeding · Betaalkosten apart</p>
        </div>
        <div class="sf-thanks" id="sf-thanks-${project.id}" style="display:none"></div>
      </div>
    `;

    if (!document.getElementById('sf-styles')) {
      const style = document.createElement('style');
      style.id = 'sf-styles';
      style.textContent = `
        .sf-widget { font-family: system-ui, sans-serif; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; max-width: 360px; background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
        .sf-label { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #4f6ef7; }
        .sf-title { margin: 6px 0 4px; font-size: 16px; color: #1a202c; }
        .sf-desc { font-size: 13px; color: #64748b; margin: 0 0 14px; }
        .sf-bar-track { background: #e2e8f0; border-radius: 99px; height: 10px; overflow: hidden; }
        .sf-bar-fill { background: linear-gradient(90deg, #4f6ef7, #7c3aed); height: 100%; border-radius: 99px; transition: width .6s ease; }
        .sf-amounts { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; margin: 6px 0 0; }
        .sf-collected { font-weight: 700; color: #1a202c; }
        .sf-pct { font-size: 26px; font-weight: 800; color: #4f6ef7; margin: 8px 0 16px; }
        .sf-amounts-choice { display: flex; gap: 8px; margin-bottom: 10px; }
        .sf-amount-btn { flex: 1; padding: 8px 0; border: 2px solid #e2e8f0; border-radius: 8px; background: #fff; cursor: pointer; font-size: 14px; font-weight: 600; transition: all .15s; }
        .sf-amount-btn:hover, .sf-amount-btn.active { border-color: #4f6ef7; color: #4f6ef7; background: #eef1ff; }
        .sf-custom-amount, .sf-name, .sf-message { width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; margin-bottom: 8px; }
        .sf-donate-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #4f6ef7, #7c3aed); color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 4px; transition: opacity .15s; }
        .sf-donate-btn:hover { opacity: .9; }
        .sf-disclaimer { font-size: 11px; color: #94a3b8; text-align: center; margin: 8px 0 0; }
        .sf-thanks { text-align: center; padding: 20px; }
        .sf-thanks h4 { color: #16a34a; font-size: 18px; margin: 0 0 8px; }
        .sf-thanks p { color: #64748b; font-size: 13px; margin: 0; }
      `;
      document.head.appendChild(style);
    }

    let selectedAmount = null;

    container.querySelectorAll('.sf-amount-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.sf-amount-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAmount = parseFloat(btn.dataset.amount);
        container.querySelector('.sf-custom-amount').value = '';
      });
    });

    container.querySelector('.sf-custom-amount').addEventListener('input', (e) => {
      container.querySelectorAll('.sf-amount-btn').forEach(b => b.classList.remove('active'));
      selectedAmount = parseFloat(e.target.value) || null;
    });

    container.querySelector('.sf-donate-btn').addEventListener('click', async () => {
      const customVal = parseFloat(container.querySelector('.sf-custom-amount').value);
      const amount = customVal || selectedAmount;
      if (!amount || amount < 1) { alert('Kies een bedrag om te doneren.'); return; }

      const donor_name = container.querySelector('.sf-name').value.trim();
      const message = container.querySelector('.sf-message').value.trim();

      try {
        const res = await fetch(`${API_BASE}/api/donate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: project.id, amount_euros: amount, donor_name, message })
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById(`sf-form-${project.id}`).style.display = 'none';
          const thanks = document.getElementById(`sf-thanks-${project.id}`);
          thanks.style.display = 'block';
          thanks.innerHTML = `
            <h4>Hartelijk dank!</h4>
            <p>Uw donatie van <strong>${formatEuros(data.donation.amount)}</strong> is ontvangen.<br>
            De school ontvangt <strong>${formatEuros(data.donation.net_amount)}</strong>.</p>
            <p style="margin-top:10px;color:#4f6ef7;font-weight:600">${pct(data.project.collected_amount, data.project.goal_amount)}% van het doel bereikt!</p>
          `;
          container.querySelector('.sf-bar-fill').style.width = pct(data.project.collected_amount, data.project.goal_amount) + '%';
          container.querySelector('.sf-collected').textContent = formatEuros(data.project.collected_amount) + ' opgehaald';
          container.querySelector('.sf-pct').textContent = pct(data.project.collected_amount, data.project.goal_amount) + '%';
        }
      } catch (e) {
        alert('Er ging iets mis. Probeer het opnieuw.');
      }
    });
  }

  async function init() {
    const containers = document.querySelectorAll('[data-schoolfund-project]');
    for (const container of containers) {
      const projectId = container.getAttribute('data-schoolfund-project');
      try {
        const res = await fetch(`${API_BASE}/api/projects/${projectId}`);
        const data = await res.json();
        renderWidget(container, data.project);
      } catch (e) {
        container.innerHTML = '<p style="color:#94a3b8;font-size:13px;padding:12px">Widget tijdelijk niet beschikbaar.</p>';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
