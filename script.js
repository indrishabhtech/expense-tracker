/* -----------------------------
   Personal Finance Tracker JS
   - Floating emojis
   - Tabs
   - Live calculations
   - Personalized advice
   - Export summary as PNG (html2canvas)
   ----------------------------- */

(function () {
  /* ---------- Floating emojis ---------- */
  const emojis = ['💰', '💵', '📊', '💳', '🏦', '💎', '📈', '🎯', '💡', '🌟'];
  const container = document.getElementById('floatingEmojis');

  function createFloating(emoji, idx) {
    const el = document.createElement('div');
    el.textContent = emoji;
    el.style.left = Math.random() * 95 + '%';
    el.style.top = (80 + Math.random() * 10) + '%'; // start slightly below view
    el.style.transform = 'translateY(0)';
    container.appendChild(el);

    // start first animation after a small delay
    setTimeout(() => animateUp(el), idx * 900);

    // repeat periodically
    setInterval(() => animateUp(el), 15000 + Math.random() * 5000);
  }

  function animateUp(el) {
    // reset
    el.style.transition = 'none';
    el.style.transform = 'translateY(0)';
    el.style.left = Math.random() * 95 + '%';
    // force repaint then animate
    requestAnimationFrame(() => {
      el.style.transition = 'transform 15s linear';
      el.style.transform = 'translateY(-140vh)';
    });
  }

  emojis.forEach((em, i) => createFloating(em, i));

  /* ---------- Tabs ---------- */
  const tabTracker = document.getElementById('tabTracker');
  const tabAbout = document.getElementById('tabAbout');
  const trackerTab = document.getElementById('trackerTab');
  const aboutTab = document.getElementById('aboutTab');

  tabTracker.addEventListener('click', () => {
    tabTracker.classList.add('active');
    tabAbout.classList.remove('active');
    trackerTab.classList.add('active');
    aboutTab.classList.remove('active');
    trackerTab.setAttribute('aria-hidden', 'false');
    aboutTab.setAttribute('aria-hidden', 'true');
    tabTracker.setAttribute('aria-selected', 'true');
    tabAbout.setAttribute('aria-selected', 'false');
  });

  tabAbout.addEventListener('click', () => {
    tabAbout.classList.add('active');
    tabTracker.classList.remove('active');
    aboutTab.classList.add('active');
    trackerTab.classList.remove('active');
    aboutTab.setAttribute('aria-hidden', 'false');
    trackerTab.setAttribute('aria-hidden', 'true');
    tabAbout.setAttribute('aria-selected', 'true');
    tabTracker.setAttribute('aria-selected', 'false');
  });

  /* ---------- Elements ---------- */
  const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
  const totalIncomeEl = document.querySelector('#totalIncome h3');
  const necessaryExpensesEl = document.querySelector('#necessaryExpenses h3');
  const totalExpensesEl = document.querySelector('#totalExpenses h3');
  const balanceEl = document.querySelector('#balance h3');
  const savingsRateEl = document.getElementById('savingsRate');
  const adviceList = document.getElementById('adviceList');
  const exportBtn = document.getElementById('exportBtn');
  const exportable = document.getElementById('exportable');

  /* ensure default numeric inputs are numbers (some had value attributes) */
  inputs.forEach(i => {
    if (!i.value) i.value = '';
    i.addEventListener('input', calculate);
  });

  /* ---------- Calculation & Advice ---------- */
  function calculate() {
    const data = {};
    inputs.forEach(i => {
      // name attribute expected
      data[i.name] = parseFloat(i.value) || 0;
    });

    const income = (data.baseSalary || 0) + (data.overtime || 0) + (data.extraSalary || 0) + (data.returns || 0);

    const necessary = (data.pg || 0) + (data.recharge || 0) + (data.haircut || 0) + (data.bills || 0) + (data.gym || 0);

    const totalExpenses = necessary + (data.savings || 0) + (data.investment || 0) + (data.familySupport || 0) + (data.emergencyFund || 0) + (data.emiAmount || 0);

    const balance = income - totalExpenses;

    // Update UI numbers
    totalIncomeEl.textContent = '₹' + Math.round(income).toLocaleString();
    necessaryExpensesEl.textContent = '₹' + Math.round(necessary).toLocaleString();
    totalExpensesEl.textContent = '₹' + Math.round(totalExpenses).toLocaleString();
    balanceEl.textContent = (balance >= 0 ? '₹' : '₹-') + Math.abs(Math.round(balance)).toLocaleString();

    // Savings rate
    const savingsRateNum = income > 0 ? ((data.savings || 0) / income) * 100 : 0;
    const savingsRateRound = income > 0 ? savingsRateNum.toFixed(1) : '0.0';
    savingsRateEl.textContent = savingsRateRound + '%';
    // color
    if (parseFloat(savingsRateRound) >= 20) {
      savingsRateEl.style.color = '#2d7a3e';
    } else if (parseFloat(savingsRateRound) >= 10) {
      savingsRateEl.style.color = '#b45309';
    } else {
      savingsRateEl.style.color = '#b91c1c';
    }

    // Generate personalized advice
    const advice = generateAdvice(data, { income, necessary, totalExpenses, balance, savingsRateNum });
    renderAdvice(advice);
  }

  function generateAdvice(data, totals) {
    const out = [];
    const income = totals.income;
    const necessary = totals.necessary;
    const balance = totals.balance;
    const savingsRate = totals.savingsRateNum;
    const emiPercent = income > 0 ? ((data.emiAmount || 0) / income) * 100 : 0;

    // Income check
    if (income <= 0) {
      out.push({ text: 'Enter your income (Base Salary / Overtime / Extra Salary) to get personalized guidance.', type: 'warning' });
      return out;
    }

    // Income band suggestions
    if (income < 40000) {
      out.push({ text: `Income band: Starting (₹${Math.round(income).toLocaleString()}). Aim to save ~15–20% of income.`, type: 'positive' });
    } else if (income <= 80000) {
      out.push({ text: `Income band: Mid-level (₹${Math.round(income).toLocaleString()}). Aim to save ~25–30% of income.`, type: 'positive' });
    } else {
      out.push({ text: `Income band: Senior (₹${Math.round(income).toLocaleString()}). Aim to save ~35–40%+ of income for aggressive wealth building.`, type: 'positive' });
    }

    // Savings rate feedback
    const target = income < 40000 ? 15 : income <= 80000 ? 25 : 35;
    const savingsRateRound = (savingsRate || 0).toFixed(1);
    if (savingsRate >= target) {
      out.push({ text: `Good job — your savings rate is ${savingsRateRound}% which meets or exceeds the suggested target of ${target}%. Keep it up!`, type: 'positive' });
    } else {
      out.push({
        text: `Your savings rate is ${savingsRateRound}%. Try to increase it toward ${target}%: reduce small recurring spends, automate a standing order, or increase SIPs gradually.`,
        type: 'warning'
      });
    }

    // Balance feedback
    if (balance < 0) {
      out.push({ text: `Alert: Expenses exceed income by ₹${Math.abs(Math.round(balance)).toLocaleString()}. You need to reduce expenses or increase income.`, type: 'negative' });

      // list top expense categories to trim
      const expenseMap = {
        'PG + Food': data.pg || 0,
        'Recharge': data.recharge || 0,
        'Haircut': data.haircut || 0,
        'Bills': data.bills || 0,
        'Gym': data.gym || 0,
        'Savings': data.savings || 0,
        'Investments': data.investment || 0,
        'Family Support': data.familySupport || 0,
        'Emergency Fund': data.emergencyFund || 0,
        'EMI Amount': data.emiAmount || 0
      };
      const sorted = Object.entries(expenseMap).sort((a, b) => b[1] - a[1]).filter(e => e[1] > 0).slice(0, 3);
      if (sorted.length) {
        const topText = sorted.map(s => `${s[0]} (₹${Math.round(s[1]).toLocaleString()})`).join(', ');
        out.push({ text: `Top expense contributors: ${topText}. Consider trimming the largest discretionary items (e.g., recharge/haircut/gym) or reviewing EMIs/investments temporarily.`, type: 'warning' });
      }
    } else if (balance < income * 0.05) {
      out.push({ text: `You have a small surplus of ₹${Math.round(balance).toLocaleString()}. Consider boosting savings or reducing a top recurring cost to create a comfortable buffer.`, type: 'warning' });
    } else {
      out.push({ text: `Nice — you have a healthy surplus of ₹${Math.round(balance).toLocaleString()}. Consider allocating some to investments or top-up your emergency fund.`, type: 'positive' });
    }

    // EMI check
    if (emiPercent > 40) {
      out.push({ text: `EMI is ${Math.round(emiPercent)}% of your income. Recommended: EMIs should ideally remain below 40% of monthly income. Consider refinancing or delaying non-essential loans.`, type: 'negative' });
    }

    // Emergency fund check (months covered)
    const monthsCovered = necessary > 0 ? (data.emergencyFund || 0) / necessary : 0;
    if (monthsCovered < 3) {
      out.push({ text: `Emergency fund covers ${monthsCovered.toFixed(1)} months of necessary expenses. Target: 3–6 months. Build this first before aggressive investing.`, type: 'warning' });
    } else {
      out.push({ text: `Emergency fund looks healthy (~${monthsCovered.toFixed(1)} months). Good job keeping liquidity.`, type: 'positive' });
    }

    // Practical next steps
    out.push({ text: `Practical steps: automate savings, review subscriptions, prioritize high-interest debt, and start/scale SIPs for long-term growth.`, type: 'positive' });

    return out;
  }

  function renderAdvice(list) {
    adviceList.innerHTML = '';
    list.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.text;
      li.classList.add(item.type === 'positive' ? 'advice-positive' : item.type === 'warning' ? 'advice-warning' : 'advice-negative');
      adviceList.appendChild(li);
    });
  }

  // initial calculation
  calculate();

  /* ---------- Export functionality using html2canvas ---------- */
  exportBtn.addEventListener('click', async () => {
    exportBtn.disabled = true;
    exportBtn.textContent = 'Generating image...';

    try {
      // ensure exportable is visible and styled correctly - html2canvas will capture
      const clone = exportable.cloneNode(true);
      // create a wrapper to render for capture (this avoids animation jitter)
      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.left = '50%';
      wrapper.style.top = '50%';
      wrapper.style.transform = 'translate(-50%,-50%)';
      wrapper.style.zIndex = 99999;
      wrapper.style.background = '#fff';
      wrapper.style.padding = '18px';
      wrapper.style.borderRadius = '12px';
      wrapper.style.boxShadow = '0 10px 40px rgba(0,0,0,0.12)';
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // wait a frame so browser paints
      await new Promise(r => requestAnimationFrame(r));

      // capture with scale for better quality
      const canvas = await html2canvas(wrapper, { scale: 1.6, useCORS: true, logging: false });
      const url = canvas.toDataURL('image/png');

      // trigger download
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `finance-summary-${timestamp}.png`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // cleanup
      wrapper.remove();
    } catch (err) {
      console.error('Export failed', err);
      alert('Could not export image. Try again.');
    } finally {
      exportBtn.disabled = false;
      exportBtn.innerHTML = '<i class="fa-solid fa-download"></i> Export Summary as Image';
    }
  });

})();

//dark mode toggle
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');    
const currentTheme = localStorage.getItem('theme');    

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
}

if (toggleSwitch) {
    toggleSwitch.addEventListener('change', (event) => {
        const theme = event.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
}
//set initial state of toggle switch
if (currentTheme === 'dark') {
    toggleSwitch.checked = true;
}
if (currentTheme === 'light') {
    toggleSwitch.checked = false;
}
//preloader
// window.addEventListener('load', function(){
//     const preloader = document.getElementById('preloader');
//     preloader.style.display = 'none';
// });
