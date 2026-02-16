let rainChartInstance, windChartInstance;
let chartData = {
  labels: [],
  rain: [],
  wind: []
};
const MAX_HISTORY = 20;

document.addEventListener("DOMContentLoaded", () => {
  const alertBox = document.getElementById("alertBox");
  const alertRegion = document.getElementById("alertRegion");

  const stateSelect = document.getElementById("stateSelect");
  const priorityList = document.getElementById("priorityList");

  // UI Elements
  const els = {
    region: document.getElementById("region"),
    risk: document.getElementById("risk"),
    prob: document.getElementById("prob"),
    wind: document.getElementById("wind"),
    rain: document.getElementById("rain"),
    time: document.getElementById("time"),
    reason: document.getElementById("reason")
  };

  // Initialize Charts
  initCharts();

  // Start polling (Map is embedded in HTML)
  fetchData();
  setInterval(fetchData, 5000);

  function fetchData() {
    fetch("/live-risk")
      .then(r => r.json())
      .then(data => updateDashboard(data))
      .catch(e => console.error("API Error:", e));
  }

  function updateDashboard(data) {
    if (!data || data.length === 0) return;

    // 1. Populate Dropdown (if empty)
    if (stateSelect.options.length === 0) {
      // Group by type for cleaner UI
      const states = data.filter(d => d.type === "state");
      const cities = data.filter(d => d.type === "city");

      // Add States
      const stateGroup = document.createElement("optgroup");
      stateGroup.label = "States";
      states.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.name;
        opt.innerText = s.name;
        stateGroup.appendChild(opt);
      });
      stateSelect.appendChild(stateGroup);

      // Add Cities
      const cityGroup = document.createElement("optgroup");
      cityGroup.label = "Cities";
      cities.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.name;
        opt.innerText = c.name;
        cityGroup.appendChild(opt);
      });
      stateSelect.appendChild(cityGroup);

      // Default selection (First City if available, else First State)
      stateSelect.value = cities.length > 0 ? cities[0].name : states[0].name;

      stateSelect.addEventListener("change", () => {
        const selected = data.find(s => s.name === stateSelect.value);
        if (selected) renderStateDetails(selected);
      });
    }

    // 2. Priority Queue
    priorityList.innerHTML = "";
    const highRisk = data.filter(s => s.severity !== "LOW")
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);

    highRisk.forEach((s, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${s.name}</strong> 
        <span class="badge ${s.severity}" style="transform:scale(0.8)">${s.severity}</span>
        <small style="color:var(--text-secondary)">Prob: ${(s.probability * 100).toFixed(0)}%</small>
      `;
      li.style.cursor = "pointer";
      li.onclick = () => {
        stateSelect.value = s.name;
        renderStateDetails(s);
      };
      priorityList.appendChild(li);
    });

    // 3. Update Map Colors
    // Map full state names to SVG IDs
    const stateMap = {
      "Andaman and Nicobar Islands": "an",
      "Andhra Pradesh": "ap",
      "Arunachal Pradesh": "ar",
      "Assam": "as",
      "Bihar": "br",
      "Chandigarh": "ch",
      "Chhattisgarh": "ct",
      "Dadra and Nagar Haveli": "dn",
      "Daman and Diu": "dd",
      "Delhi": "dl",
      "Goa": "ga",
      "Gujarat": "gj",
      "Haryana": "hr",
      "Himachal Pradesh": "hp",
      "Jammu and Kashmir": "jk",
      "Jharkhand": "jh",
      "Karnataka": "ka",
      "Kerala": "kl",
      "Lakshadweep": "ld",
      "Madhya Pradesh": "mp",
      "Maharashtra": "mh",
      "Manipur": "mn",
      "Meghalaya": "ml",
      "Mizoram": "mz",
      "Nagaland": "nl",
      "Odisha": "or",
      "Puducherry": "py",
      "Punjab": "pb",
      "Rajasthan": "rj",
      "Sikkim": "sk",
      "Tamil Nadu": "tn",
      "Telangana": "tg",
      "Tripura": "tr",
      "Uttar Pradesh": "up",
      "Uttarakhand": "ut",
      "West Bengal": "wb"
    };

    const svgContainer = document.getElementById("mapContainer");
    const svgEl = svgContainer ? svgContainer.querySelector("svg") : null;

    if (svgEl) {
      // 1. CLEAR EXISTING CITY DOTS (if any)
      const existingDots = svgEl.querySelectorAll(".city-dot");
      existingDots.forEach(dot => dot.remove());

      data.forEach(item => {
        if (item.type === "state") {
          // Process States
          const id = stateMap[item.name] || item.name.replace(/ /g, "_");
          const el = document.getElementById(id); // Look in entire document since it's inline

          if (el) {
            let color = "#22c55e"; // Low (Green)
            if (item.severity === "MEDIUM") color = "#eab308"; // Yellow
            if (item.severity === "HIGH") color = "#ef4444"; // Red (High)

            // Since it's inline SVG, 'el' is the path itself or group
            // If it's a group <g>, try to find path inside, else color the element
            const target = el.tagName === 'path' ? el : (el.querySelector("path") || el);

            target.style.fill = color;

            // Add click listener
            el.onclick = () => {
              stateSelect.value = item.name;
              renderStateDetails(item);
            }
          }
        } else if (item.type === "city") {
          // Process Cities
          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute("cx", item.x);
          circle.setAttribute("cy", item.y);
          circle.setAttribute("r", item.severity === "HIGH" ? "8" : "5");
          circle.setAttribute("class", `city-dot ${item.severity}`);

          let fill = "#3b82f6"; // Default Blue for cities
          if (item.severity === "MEDIUM") fill = "#f59e0b";
          if (item.severity === "HIGH") fill = "#dc2626";

          circle.style.fill = fill;
          circle.style.stroke = "#fff";
          circle.style.strokeWidth = "2";
          circle.style.cursor = "pointer";

          // Animation for high risk
          if (item.severity === "HIGH") {
            circle.innerHTML = `<animate attributeName="r" values="8;12;8" dur="1.5s" repeatCount="indefinite" />
             <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite" />`;
          }

          circle.onclick = (e) => {
            e.stopPropagation(); // Prevent state click
            stateSelect.value = item.name;
            renderStateDetails(item);
          };

          // Append to SVG
          svgEl.appendChild(circle);
        }
      });
    }

    // 4. Update Current View
    const currentName = stateSelect.value || data[0].name;
    const currentItem = data.find(s => s.name === currentName);
    if (currentItem) {
      renderStateDetails(currentItem);
      updateCharts(currentItem);
    }

    // 5. Global Alert
    const critical = data.find(s => s.severity === "HIGH");
    if (critical) {
      alertBox.classList.remove("hidden");
      alertRegion.innerText = critical.name + (critical.type === "city" ? " (City)" : "");
    } else {
      alertBox.classList.add("hidden");
    }
  }

  function renderStateDetails(s) {
    els.region.innerText = s.name;
    els.risk.innerText = s.severity;
    els.risk.className = "badge " + s.severity;
    els.prob.innerText = (s.probability * 100).toFixed(0);
    els.wind.innerText = s.wind_speed;
    els.rain.innerText = s.rain_mm;
    els.time.innerText = s.last_updated;

    els.reason.innerHTML = "";
    s.reason.forEach(r => {
      const li = document.createElement("li");
      li.innerText = "• " + r;
      els.reason.appendChild(li);
    });
  }

  function initCharts() {
    const ctxRain = document.getElementById("rainChart").getContext("2d");
    const ctxWind = document.getElementById("windChart").getContext("2d");

    Chart.defaults.color = "#94a3b8";
    Chart.defaults.borderColor = "rgba(148, 163, 184, 0.1)";

    rainChartInstance = new Chart(ctxRain, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Rainfall (mm)',
          data: [],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          fill: true,
          tension: 0.4
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    windChartInstance = new Chart(ctxWind, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Wind (km/h)',
          data: [],
          borderColor: '#eab308',
          backgroundColor: 'rgba(234, 179, 8, 0.5)',
          fill: true,
          tension: 0.4
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  function updateCharts(s) {
    const now = new Date().toLocaleTimeString();

    // We only track the current selected state's live trend for this demo
    // In a real app, we'd fetch history array from backend.

    if (chartData.labels.length > MAX_HISTORY) {
      chartData.labels.shift();
      chartData.rain.shift();
      chartData.wind.shift();
    }

    chartData.labels.push(now);
    chartData.rain.push(s.rain_mm);
    chartData.wind.push(s.wind_speed);

    rainChartInstance.data.labels = chartData.labels;
    rainChartInstance.data.datasets[0].data = chartData.rain;
    rainChartInstance.update();

    windChartInstance.data.labels = chartData.labels;
    windChartInstance.data.datasets[0].data = chartData.wind;
    windChartInstance.update();
  }

});
