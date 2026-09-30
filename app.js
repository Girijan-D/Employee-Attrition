// Application State & Logic for Employee Attrition Prediction App

document.addEventListener('DOMContentLoaded', () => {
  // Navigation & View switching
  const navTabs = document.querySelectorAll('.nav-tab');
  const viewSections = document.querySelectorAll('.view-section');
  const loginOverlay = document.getElementById('login-overlay');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  const userProfile = document.getElementById('user-profile');

  // Chart instances container
  const charts = {};

  // Default initial prediction logs matching Image #3
  let predictionLogs = [
    { timestamp: '2025-06-10 14:32', id: 'E1024', prediction: 'High Risk', probability: 0.78, status: 'Success' },
    { timestamp: '2025-06-10 14:28', id: 'E0876', prediction: 'High Risk', probability: 0.71, status: 'Success' },
    { timestamp: '2025-06-10 14:21', id: 'E0643', prediction: 'Low Risk', probability: 0.23, status: 'Success' },
    { timestamp: '2025-06-10 14:15', id: 'E0912', prediction: 'Medium Risk', probability: 0.56, status: 'Success' },
    { timestamp: '2025-06-10 14:08', id: 'E0775', prediction: 'Low Risk', probability: 0.21, status: 'Success' }
  ];

  // Auth Handling
  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    if (username.trim()) {
      loginOverlay.classList.add('hidden');
      switchView('dashboard');
    }
  });

  logoutBtn?.addEventListener('click', () => {
    loginOverlay.classList.remove('hidden');
  });

  // Tab Switching
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetView = tab.getAttribute('data-view');
      if (targetView) {
        switchView(targetView);
      }
    });
  });

  function switchView(viewId) {
    navTabs.forEach(tab => {
      if (tab.getAttribute('data-view') === viewId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    viewSections.forEach(section => {
      if (section.id === `${viewId}-view`) {
        section.classList.remove('hidden');
      } else {
        section.classList.add('hidden');
      }
    });

    // Render/refresh view-specific charts
    if (viewId === 'dashboard') {
      renderDashboardCharts();
      renderDashboardTable();
    } else if (viewId === 'analytics') {
      renderAnalyticsCharts();
    } else if (viewId === 'model-performance') {
      renderModelPerformanceCharts();
    } else if (viewId === 'monitoring') {
      renderMonitoringLogs();
    }
  }

  // Predict Attrition ML Engine
  const predictForm = document.getElementById('attrition-predict-form');
  const predictResultContainer = document.getElementById('predict-result-container');
  const btnNewPredict = document.getElementById('btn-new-predict');

  predictForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const empId = document.getElementById('input-emp-id').value || `E${Math.floor(1000 + Math.random() * 9000)}`;
    const age = parseInt(document.getElementById('input-age').value) || 32;
    const department = document.getElementById('input-dept').value;
    const jobRole = document.getElementById('input-role').value;
    const income = parseInt(document.getElementById('input-income').value) || 60000;
    const overtime = document.getElementById('input-overtime').value;
    const satisfaction = parseInt(document.getElementById('input-satisfaction').value) || 3;
    const wlb = parseInt(document.getElementById('input-wlb').value) || 3;
    const years = parseInt(document.getElementById('input-years').value) || 3;

    // ML Score Calculation Strategy based on feature importance weights
    let score = 0.20; // baseline

    // Overtime weight ~ 0.32
    if (overtime === 'Yes') score += 0.32;
    
    // Job satisfaction weight ~ 0.24 (Satisfaction 1-5)
    if (satisfaction === 1) score += 0.24;
    else if (satisfaction === 2) score += 0.16;
    else if (satisfaction === 3) score += 0.08;
    else if (satisfaction === 4) score += 0.02;

    // Monthly Income weight ~ 0.18
    if (income < 35000) score += 0.18;
    else if (income < 55000) score += 0.12;
    else if (income < 75000) score += 0.06;

    // Years at company weight ~ 0.14
    if (years <= 2) score += 0.14;
    else if (years <= 4) score += 0.08;
    else if (years <= 6) score += 0.04;

    // Work-life balance
    if (wlb <= 2) score += 0.08;

    // Age factor
    if (age < 28) score += 0.06;

    // Cap score between 0.05 and 0.98
    const proba = Math.min(0.98, Math.max(0.05, Math.round(score * 100) / 100));
    const percentage = Math.round(proba * 100);

    // Determine Risk Category
    let riskCat = 'Low Risk';
    if (percentage >= 60) riskCat = 'High Risk';
    else if (percentage >= 40) riskCat = 'Medium Risk';

    // Render Prediction Outcome matching Screenshot #4
    renderPredictionOutcome({
      empId,
      age,
      jobRole,
      department,
      income,
      satisfaction,
      years,
      overtime,
      proba,
      percentage,
      riskCat
    });

    // Save to Monitoring Logs
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    
    predictionLogs.unshift({
      timestamp: timeStr,
      id: empId,
      prediction: riskCat,
      probability: proba,
      status: 'Success'
    });

    // Show result view
    predictResultContainer.classList.remove('hidden');
    predictResultContainer.scrollIntoView({ behavior: 'smooth' });
  });

  btnNewPredict?.addEventListener('click', () => {
    predictResultContainer.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function renderPredictionOutcome(data) {
    const alertBox = document.getElementById('res-alert-box');
    const alertTitle = document.getElementById('res-alert-title');
    const alertDesc = document.getElementById('res-alert-desc');
    const gaugeCircle = document.getElementById('res-gauge-circle');
    const gaugeVal = document.getElementById('res-gauge-val');

    // Summary details
    document.getElementById('res-sum-age').textContent = data.age;
    document.getElementById('res-sum-role').textContent = data.jobRole;
    document.getElementById('res-sum-income').textContent = `₹${data.income.toLocaleString()}`;
    document.getElementById('res-sum-satisfaction').textContent = `${data.satisfaction}/5`;
    document.getElementById('res-sum-years').textContent = `${data.years} years`;
    document.getElementById('res-sum-overtime').textContent = data.overtime;

    gaugeVal.textContent = `${data.percentage}%`;

    if (data.riskCat === 'High Risk') {
      alertBox.className = 'result-header-alert';
      alertTitle.textContent = 'High Risk';
      alertDesc.textContent = 'This employee is likely to leave the organization.';
      gaugeCircle.style.background = `conic-gradient(#DC2626 0% ${data.percentage}%, #E2E8F0 ${data.percentage}% 100%)`;
    } else if (data.riskCat === 'Medium Risk') {
      alertBox.className = 'result-header-alert';
      alertBox.style.backgroundColor = '#FFFBEB';
      alertBox.style.borderColor = '#FDE68A';
      alertTitle.style.color = '#D97706';
      alertTitle.textContent = 'Medium Risk';
      alertDesc.style.color = '#B45309';
      alertDesc.textContent = 'This employee shows moderate signs of attrition risk.';
      gaugeCircle.style.background = `conic-gradient(#F59E0B 0% ${data.percentage}%, #E2E8F0 ${data.percentage}% 100%)`;
    } else {
      alertBox.className = 'result-header-alert low-risk';
      alertTitle.textContent = 'Low Risk';
      alertDesc.textContent = 'This employee is likely to stay in the organization.';
      gaugeCircle.style.background = `conic-gradient(#16A34A 0% ${data.percentage}%, #E2E8F0 ${data.percentage}% 100%)`;
    }
  }

  // --- CHART RENDERING LOGIC ---

  function renderDashboardCharts() {
    // 1. Attrition Distribution Donut (Image #1)
    const ctx1 = document.getElementById('chart-attrition-dist')?.getContext('2d');
    if (ctx1 && !charts['dashboardDist']) {
      charts['dashboardDist'] = new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: ['Stayed', 'Left'],
          datasets: [{
            data: [79.8, 20.2],
            backgroundColor: ['#2563EB', '#F97316'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => ` ${context.label}: ${context.raw}%`
              }
            }
          }
        }
      });
    }

    // 2. Attrition by Department Bar (Image #1)
    const ctx2 = document.getElementById('chart-attrition-dept')?.getContext('2d');
    if (ctx2 && !charts['dashboardDept']) {
      charts['dashboardDept'] = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: ['HR', 'Sales', 'R&D', 'IT', 'Finance'],
          datasets: [{
            data: [32.1, 24.5, 18.7, 16.3, 12.4],
            backgroundColor: '#2563EB',
            borderRadius: 4,
            barThickness: 32
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (ctx) => ` Attrition: ${ctx.raw}%` }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 40,
              ticks: { callback: v => v + '%' },
              grid: { color: '#F1F5F9' }
            },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // 3. Monthly Attrition Trend Line (Image #1)
    const ctx3 = document.getElementById('chart-attrition-trend')?.getContext('2d');
    if (ctx3 && !charts['dashboardTrend']) {
      charts['dashboardTrend'] = new Chart(ctx3, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            data: [24, 19, 16, 17, 13, 18, 19, 20, 23, 22, 19, 22],
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2,
            pointBackgroundColor: '#2563EB',
            pointRadius: 4,
            fill: false,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              max: 40,
              ticks: { callback: v => v + '%' },
              grid: { color: '#F1F5F9' }
            },
            x: { grid: { display: false } }
          }
        }
      });
    }
  }

  function renderDashboardTable() {
    const tbody = document.getElementById('dashboard-risk-tbody');
    if (!tbody) return;
    tbody.innerHTML = `
      <tr>
        <td>E1024</td>
        <td>R. Sharma</td>
        <td>Sales</td>
        <td>Sales Executive</td>
        <td><span class="risk-pill high">0.92</span></td>
        <td>2021-06-14</td>
      </tr>
      <tr>
        <td>E0876</td>
        <td>P. Nair</td>
        <td>R&D</td>
        <td>Research Scientist</td>
        <td><span class="risk-pill high">0.88</span></td>
        <td>2020-11-03</td>
      </tr>
      <tr>
        <td>E0643</td>
        <td>S. Iyer</td>
        <td>HR</td>
        <td>HR Executive</td>
        <td><span class="risk-pill high">0.85</span></td>
        <td>2022-02-17</td>
      </tr>
      <tr>
        <td>E0912</td>
        <td>A. Khan</td>
        <td>IT</td>
        <td>Software Engineer</td>
        <td><span class="risk-pill high">0.82</span></td>
        <td>2021-09-26</td>
      </tr>
      <tr>
        <td>E0775</td>
        <td>M. Das</td>
        <td>Finance</td>
        <td>Analyst</td>
        <td><span class="risk-pill high">0.80</span></td>
        <td>2022-01-11</td>
      </tr>
    `;
  }

  function renderAnalyticsCharts() {
    // 1. Dept Bar Chart (Image #5)
    const ctxDept = document.getElementById('chart-analytics-dept')?.getContext('2d');
    if (ctxDept && !charts['anaDept']) {
      charts['anaDept'] = new Chart(ctxDept, {
        type: 'bar',
        data: {
          labels: ['HR', 'Sales', 'R&D', 'IT', 'Finance'],
          datasets: [{ data: [32.1, 24.5, 18.7, 16.3, 12.4], backgroundColor: '#2563EB', borderRadius: 4 }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: 40, ticks: { callback: v => v + '%' } }, x: { grid: { display: false } } }
        }
      });
    }

    // 2. Age Group Bar Chart (Image #5)
    const ctxAge = document.getElementById('chart-analytics-age')?.getContext('2d');
    if (ctxAge && !charts['anaAge']) {
      charts['anaAge'] = new Chart(ctxAge, {
        type: 'bar',
        data: {
          labels: ['<25', '25-34', '35-44', '45-54', '55+'],
          datasets: [{ data: [15.2, 28.7, 22.1, 16.8, 10.3], backgroundColor: '#2563EB', borderRadius: 4 }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: 40, ticks: { callback: v => v + '%' } }, x: { grid: { display: false } } }
        }
      });
    }

    // 3. Job Satisfaction Bar Chart (Image #5)
    const ctxSat = document.getElementById('chart-analytics-satisfaction')?.getContext('2d');
    if (ctxSat && !charts['anaSat']) {
      charts['anaSat'] = new Chart(ctxSat, {
        type: 'bar',
        data: {
          labels: ['1', '2', '3', '4', '5'],
          datasets: [{ data: [34.5, 28.7, 20.4, 12.6, 7.8], backgroundColor: '#2563EB', borderRadius: 4 }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: 40, ticks: { callback: v => v + '%' } }, x: { grid: { display: false } } }
        }
      });
    }

    // 4. Overtime Donut Chart (Image #5)
    const ctxOt = document.getElementById('chart-analytics-overtime')?.getContext('2d');
    if (ctxOt && !charts['anaOt']) {
      charts['anaOt'] = new Chart(ctxOt, {
        type: 'doughnut',
        data: {
          labels: ['Yes', 'No'],
          datasets: [{ data: [30.8, 69.2], backgroundColor: ['#2563EB', '#BFDBFE'], borderWidth: 0 }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: { legend: { display: false } }
        }
      });
    }

    // 5. Monthly Income Bar Chart (Image #5)
    const ctxInc = document.getElementById('chart-analytics-income')?.getContext('2d');
    if (ctxInc && !charts['anaInc']) {
      charts['anaInc'] = new Chart(ctxInc, {
        type: 'bar',
        data: {
          labels: ['<30K', '30-50K', '50-70K', '70-100K', '>100K'],
          datasets: [{ data: [28.4, 24.8, 18.6, 13.2, 8.7], backgroundColor: '#2563EB', borderRadius: 4 }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, max: 40, ticks: { callback: v => v + '%' } }, x: { grid: { display: false } } }
        }
      });
    }
  }

  function renderModelPerformanceCharts() {
    // Feature Importance Horizontal Bar Chart (Image #2)
    const ctxFeat = document.getElementById('chart-feature-importance')?.getContext('2d');
    if (ctxFeat && !charts['featImp']) {
      charts['featImp'] = new Chart(ctxFeat, {
        type: 'bar',
        data: {
          labels: ['Overtime', 'Job Satisfaction', 'Monthly Income', 'Years at Company', 'Work-Life Balance', 'Age'],
          datasets: [{
            data: [0.21, 0.18, 0.14, 0.11, 0.08, 0.06],
            backgroundColor: '#2563EB',
            borderRadius: 4,
            barThickness: 18
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, max: 0.3, grid: { color: '#F1F5F9' } },
            y: { grid: { display: false } }
          }
        }
      });
    }
  }

  function renderMonitoringLogs() {
    const tbody = document.getElementById('monitoring-logs-tbody');
    if (!tbody) return;

    tbody.innerHTML = predictionLogs.map(log => {
      let riskClass = 'low';
      if (log.prediction === 'High Risk') riskClass = 'high';
      else if (log.prediction === 'Medium Risk') riskClass = 'medium';

      return `
        <tr>
          <td>${log.timestamp}</td>
          <td>${log.id}</td>
          <td><span class="risk-pill ${riskClass}">${log.prediction}</span></td>
          <td>${log.probability.toFixed(2)}</td>
          <td><span class="status-pill success">${log.status}</span></td>
        </tr>
      `;
    }).join('');
  }

  // Initialize view
  switchView('dashboard');
});
