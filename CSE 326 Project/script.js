// RoadGRAMS - Vanilla JavaScript (LocalStorage Powered)
const STORAGE_KEY = "roadgrams_sem1_data";

// Default sample grievances loaded on first visit
const defaultGrievances = [
  {
    id: "RDGRM/2026/00101",
    citizenName: "Aarav Sharma",
    mobile: "9876543210",
    ward: "Ward 14 - Sector 14",
    pincode: "110014",
    roadName: "MG Road Main Corridor",
    landmark: "Opposite Government Polytechnic Gate",
    category: "Pothole & Surface Crack",
    severity: "Urgent Hazard",
    description: "Deep potholes near the college bus stop causing hazard for two-wheelers.",
    status: "In Progress",
    filedOn: "11 Nov 2026",
    timeline: [
      { date: "11 Nov 2026", status: "Received", remark: "Complaint logged and forwarded to PWD Road Division." },
      { date: "14 Nov 2026", status: "In Progress", remark: "Site inspected; hot-mix bitumen repair crew deployed." }
    ]
  },
  {
    id: "RDGRM/2026/00102",
    citizenName: "Meera Iyer",
    mobile: "9823412098",
    ward: "Ward 08 - Civil Lines",
    pincode: "226001",
    roadName: "Station Road Pedestrian Avenue",
    landmark: "Near Central Library Crosswalk",
    category: "Broken Streetlight",
    severity: "Moderate",
    description: "Four LED streetlamps non-functional at pedestrian crossing.",
    status: "Resolved",
    filedOn: "04 Nov 2026",
    timeline: [
      { date: "04 Nov 2026", status: "Received", remark: "Forwarded to Municipal Electrical Wing." },
      { date: "09 Nov 2026", status: "Resolved", remark: "Faulty feeder repaired and all 4 lamps restored." }
    ]
  }
];

let lastSubmittedId = "";

// Load grievances from browser localStorage
function getGrievances() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultGrievances));
    return [...defaultGrievances];
  }
  return JSON.parse(raw);
}

function saveGrievances(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// Navigation switcher
function showSection(name) {
  document.querySelectorAll(".page-section").forEach((sec) => sec.classList.remove("active"));
  document.getElementById("section-" + name).classList.add("active");
  refreshUI();
}

// Update KPI counters, Register table, and Officer dropdown
function refreshUI() {
  const list = getGrievances();
  document.getElementById("stat-total").textContent = list.length;
  document.getElementById("stat-resolved").textContent = list.filter((g) => g.status === "Resolved").length;
  document.getElementById("stat-progress").textContent = list.filter((g) => g.status === "In Progress").length;
  document.getElementById("stat-pending").textContent = list.filter(
    (g) => g.status === "Received" || g.status === "Under Inspection"
  ).length;

  renderRegisterTable();
  populateOfficerDropdown();
}

// Generate CPGRAMS-style Registration Number
function createRegistrationId(list) {
  const nextNumber = String(101 + list.length).padStart(5, "0");
  return "RDGRM/2026/" + nextNumber;
}

// Handle Lodge Grievance Form Submission
document.getElementById("grievance-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const list = getGrievances();
  const newId = createRegistrationId(list);
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const newGrievance = {
    id: newId,
    citizenName: document.getElementById("citizenName").value.trim(),
    mobile: document.getElementById("mobile").value.trim(),
    ward: document.getElementById("ward").value.trim(),
    pincode: document.getElementById("pincode").value.trim(),
    roadName: document.getElementById("roadName").value.trim(),
    landmark: document.getElementById("landmark").value.trim(),
    category: document.getElementById("category").value,
    severity: document.getElementById("severity").value,
    description: document.getElementById("description").value.trim(),
    status: "Received",
    filedOn: today,
    timeline: [
      { date: today, status: "Received", remark: "Grievance registered and queued for PWD site inspection." }
    ]
  };

  list.unshift(newGrievance);
  saveGrievances(list);
  lastSubmittedId = newId;

  document.getElementById("receipt-id").textContent = newId;
  document.getElementById("receipt-summary").textContent =
    newGrievance.category + " at " + newGrievance.roadName + " (" + newGrievance.ward + ")";
  document.getElementById("receipt-box").classList.remove("hidden");

  this.reset();
  refreshUI();
});

function trackLastSubmitted() {
  document.getElementById("track-input").value = lastSubmittedId;
  showSection("track");
  trackGrievance();
}

// Track by Registration ID
function trackGrievance(presetId) {
  const query = (presetId || document.getElementById("track-input").value).trim().toUpperCase();
  const list = getGrievances();
  const found = list.find((item) => item.id.toUpperCase() === query);

  const resultBox = document.getElementById("track-result");
  const errorBox = document.getElementById("track-error");

  if (!found) {
    resultBox.classList.add("hidden");
    errorBox.classList.remove("hidden");
    return;
  }

  errorBox.classList.add("hidden");
  resultBox.classList.remove("hidden");

  const timelineHtml = found.timeline
    .map((step) => "<li><strong>" + step.status + "</strong> (" + step.date + ")<br/>" + step.remark + "</li>")
    .join("");

  resultBox.innerHTML =
    "<p class='kicker'>" + found.id + " &middot; " + found.status + "</p>" +
    "<h3>" + found.category + " - " + found.roadName + "</h3>" +
    "<p class='subtitle'>" + found.ward + " &middot; Landmark: " + found.landmark + " &middot; PIN " + found.pincode + "</p>" +
    "<p><strong>Filed By:</strong> " + found.citizenName + " (" + found.mobile + ")</p>" +
    "<p style='margin-top:8px;'><strong>Description:</strong> " + found.description + "</p>" +
    "<ul class='timeline-list'>" + timelineHtml + "</ul>";
}

// Render Public Register Table
function renderRegisterTable() {
  const filter = document.getElementById("filter-status").value;
  const list = getGrievances().filter((item) => filter === "All" || item.status === filter);
  const tbody = document.getElementById("register-tbody");

  tbody.innerHTML = list
    .map(
      (item) =>
        "<tr>" +
        "<td><strong>" + item.id + "</strong></td>" +
        "<td>" + item.roadName + "<br/><small>" + item.ward + "</small></td>" +
        "<td>" + item.category + "</td>" +
        "<td>" + item.filedOn + "</td>" +
        "<td><strong>" + item.status + "</strong></td>" +
        "<td><button class='btn-secondary' onclick=\"openFromTable('" + item.id + "')\">Track</button></td>" +
        "</tr>"
    )
    .join("");
}

function openFromTable(id) {
  document.getElementById("track-input").value = id;
  showSection("track");
  trackGrievance(id);
}

// Officer Desk Controls
function populateOfficerDropdown() {
  const select = document.getElementById("officer-select-id");
  const list = getGrievances();
  select.innerHTML = list
    .map((item) => "<option value='" + item.id + "'>" + item.id + " - " + item.roadName + " (" + item.status + ")</option>")
    .join("");
}

function updateOfficerStatus() {
  const id = document.getElementById("officer-select-id").value;
  const status = document.getElementById("officer-status").value;
  const remark = document.getElementById("officer-remark").value.trim();

  if (!remark) {
    alert("Please enter an inspection or action remark.");
    return;
  }

  const list = getGrievances();
  const target = list.find((item) => item.id === id);
  if (!target) return;

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  target.status = status;
  target.timeline.push({ date: today, status: status, remark: remark });

  saveGrievances(list);
  document.getElementById("officer-remark").value = "";
  const msg = document.getElementById("officer-msg");
  msg.classList.remove("hidden");
  setTimeout(() => msg.classList.add("hidden"), 2500);
  refreshUI();
}

// Initialize on load
refreshUI();