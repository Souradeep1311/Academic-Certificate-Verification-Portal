// Sample Certificate Records stored in a simple array
let certificates = [
  {
    id: "LPU-CSE-57",
    name: "Souradeep",
    roll: "57",
    course: "B.Tech CSE",
    institution: "Lovely Professional University",
    date: "2026-05-15",
    status: "Valid",
    hideRoll: false,
    maskName: false
  },
  {
    id: "LPU-CSE-69",
    name: "Krish",
    roll: "69",
    course: "B.Tech CSE",
    institution: "Lovely Professional University",
    date: "2026-05-15",
    status: "Revoked",
    hideRoll: false,
    maskName: false
  },
  {
    id: "LPU-CSE-09",
    name: "Rishab",
    roll: "09",
    course: "B.Tech CSE",
    institution: "Lovely Professional University",
    date: "2026-05-15",
    status: "Valid",
    hideRoll: true,
    maskName: true
  }
];

// Audit Log array
let auditLogs = [
  {
    time: "Initial Setup",
    action: "System Ready",
    details: "Loaded 3 student records (Souradeep, Krish, Rishab - B.Tech CSE)."
  }
];

// Switch tabs and highlight active button
function showSection(sectionId, clickedButton) {
  document.getElementById("public-section").style.display = "none";
  document.getElementById("issuer-section").style.display = "none";
  document.getElementById(sectionId).style.display = "block";

  document.getElementById("btn-public").classList.remove("active");
  document.getElementById("btn-issuer").classList.remove("active");
  if (clickedButton) {
    clickedButton.classList.add("active");
  }
}

// Add an entry to the Audit Log
function addAuditLog(action, details) {
  let now = new Date().toLocaleTimeString();
  auditLogs.unshift({
    time: now,
    action: action,
    details: details
  });
  renderAuditLog();
}

// Mask student name for privacy (e.g., "Rohan Das" -> "R**** D**")
function maskStudentName(fullName) {
  let words = fullName.trim().split(" ");
  let masked = [];
  for (let i = 0; i < words.length; i++) {
    let w = words[i];
    if (w.length > 1) {
      masked.push(w[0] + "*".repeat(w.length - 1));
    } else {
      masked.push("*");
    }
  }
  return masked.join(" ");
}

// Draw a simple QR-style pattern on <canvas>
function drawSimpleQR(canvasId, text) {
  let canvas = document.getElementById(canvasId);
  let ctx = canvas.getContext("2d");
  let size = 132;
  let cells = 12;
  let cellSize = size / cells;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#0f172a";

  function drawCorner(x, y) {
    ctx.fillRect(x * cellSize, y * cellSize, cellSize * 3, cellSize * 3);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect((x + 0.6) * cellSize, (y + 0.6) * cellSize, cellSize * 1.8, cellSize * 1.8);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect((x + 1.1) * cellSize, (y + 1.1) * cellSize, cellSize * 0.8, cellSize * 0.8);
  }
  drawCorner(0, 0);
  drawCorner(cells - 3, 0);
  drawCorner(0, cells - 3);

  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed += text.charCodeAt(i) * (i + 1);
  }

  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      let inCorner =
        (row < 4 && col < 4) ||
        (row < 4 && col >= cells - 4) ||
        (row >= cells - 4 && col < 4);
      if (inCorner) continue;

      if ((seed + row * 7 + col * 13) % 2 === 0) {
        ctx.fillRect(col * cellSize, row * cellSize, cellSize - 1, cellSize - 1);
      }
    }
  }
}

function fillAndVerify(id) {
  document.getElementById("verifyInput").value = id;
  verifyCertificate();
}

// Public Verification Function (Validation + Privacy Controls)
function verifyCertificate() {
  let input = document.getElementById("verifyInput").value.trim().toUpperCase();
  let errorEl = document.getElementById("verifyError");
  let resultBox = document.getElementById("verifyResult");

  errorEl.textContent = "";
  resultBox.style.display = "none";

  if (input === "") {
    errorEl.textContent = "Please enter a Verification ID.";
    return;
  }

  let found = null;
  for (let i = 0; i < certificates.length; i++) {
    if (certificates[i].id === input) {
      found = certificates[i];
      break;
    }
  }

  if (!found) {
    errorEl.textContent = "Certificate not found! This record is invalid or does not exist.";
    addAuditLog("Verification Failed", "Searched ID: " + input + " (Not Found)");
    return;
  }

  resultBox.style.display = "block";
  document.getElementById("resId").textContent = found.id;
  document.getElementById("resCourse").textContent = found.course;
  document.getElementById("resInstitution").textContent = found.institution;
  document.getElementById("resDate").textContent = found.date;

  // Apply Privacy Controls
  document.getElementById("resName").textContent = found.maskName
    ? maskStudentName(found.name) + " (Masked)"
    : found.name;

  document.getElementById("resRoll").textContent = found.hideRoll
    ? "Hidden by Privacy Control"
    : found.roll;

  // Update Status Banner & Badge
  let banner = document.getElementById("resBanner");
  let titleEl = document.getElementById("resStatusTitle");
  let subEl = document.getElementById("resStatusSub");
  let badgeEl = document.getElementById("resStatusBadge");

  badgeEl.textContent = found.status;
  badgeEl.className = "badge";
  banner.className = "result-banner";

  if (found.status === "Valid") {
    banner.classList.add("banner-valid");
    badgeEl.classList.add("badge-valid");
    titleEl.textContent = "Genuine & Valid Certificate";
    subEl.textContent = "Verified against official institution records.";
  } else if (found.status === "Revoked") {
    banner.classList.add("banner-revoked");
    badgeEl.classList.add("badge-revoked");
    titleEl.textContent = "Certificate Revoked";
    subEl.textContent = "Warning: This certificate is no longer valid.";
  } else {
    banner.classList.add("banner-expired");
    badgeEl.classList.add("badge-expired");
    titleEl.textContent = "Certificate Expired";
    subEl.textContent = "Notice: This credential has passed its validity period.";
  }

  drawSimpleQR("publicQrCanvas", found.id);
  addAuditLog("Verified Certificate", "Checked " + found.id + " (Status: " + found.status + ")");
}

// Issuer Login
function handleLogin(event) {
  event.preventDefault();
  let user = document.getElementById("username").value.trim();
  let pass = document.getElementById("password").value.trim();
  let errorEl = document.getElementById("loginError");

  if (user === "" || pass === "") {
    errorEl.textContent = "Please enter both username and password.";
    return;
  }

  if (user === "admin" && pass === "1234") {
    errorEl.textContent = "";
    document.getElementById("login-box").style.display = "none";
    document.getElementById("dashboard-box").style.display = "block";
    document.getElementById("loggedUser").textContent = user;

    addAuditLog("Issuer Login", "Authorized issuer 'admin' logged in.");
    updateStats();
    renderRecordsTable();
    renderAuditLog();
  } else {
    errorEl.textContent = "Invalid username or password. Try admin / 1234.";
    addAuditLog("Login Failed", "Failed login attempt for username: " + user);
  }
}

function logout() {
  document.getElementById("dashboard-box").style.display = "none";
  document.getElementById("login-box").style.display = "block";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  addAuditLog("Issuer Logout", "Issuer logged out.");
}

// Update Dashboard Stat Cards
function updateStats() {
  let validCount = 0;
  let inactiveCount = 0;

  for (let i = 0; i < certificates.length; i++) {
    if (certificates[i].status === "Valid") {
      validCount++;
    } else {
      inactiveCount++;
    }
  }

  document.getElementById("statTotal").textContent = certificates.length;
  document.getElementById("statValid").textContent = validCount;
  document.getElementById("statInactive").textContent = inactiveCount;
}

// Create New Certificate Record
function createCertificate(event) {
  event.preventDefault();

  let name = document.getElementById("studentName").value.trim();
  let roll = document.getElementById("rollNumber").value.trim();
  let course = document.getElementById("courseName").value.trim();
  let institution = document.getElementById("institutionName").value.trim();
  let date = document.getElementById("issueDate").value;
  let status = document.getElementById("certStatus").value;
  let hideRoll = document.getElementById("hideRoll").checked;
  let maskName = document.getElementById("maskName").checked;

  let errorEl = document.getElementById("createError");
  let successEl = document.getElementById("createSuccess");
  errorEl.textContent = "";
  successEl.textContent = "";

  if (name === "" || roll === "" || course === "" || institution === "" || date === "") {
    errorEl.textContent = "Please fill in all required (*) fields.";
    return;
  }

  let newId = "LPU-CSE-" + roll.toUpperCase();

  // Check if a certificate with this Roll Number / ID already exists
  for (let i = 0; i < certificates.length; i++) {
    if (certificates[i].id === newId) {
      errorEl.textContent = "Certificate ID " + newId + " already exists! Please enter a different Roll Number.";
      return;
    }
  }

  certificates.unshift({
    id: newId,
    name: name,
    roll: roll,
    course: course,
    institution: institution,
    date: date,
    status: status,
    hideRoll: hideRoll,
    maskName: maskName
  });

  successEl.textContent = "Certificate published! Unique ID: " + newId;
  addAuditLog("Certificate Created", "Issued " + newId + " to " + name);

  document.getElementById("studentName").value = "";
  document.getElementById("rollNumber").value = "";
  document.getElementById("hideRoll").checked = false;
  document.getElementById("maskName").checked = false;

  updateStats();
  renderRecordsTable();
}

// Change Status
function changeStatus(certId, newStatus) {
  for (let i = 0; i < certificates.length; i++) {
    if (certificates[i].id === certId) {
      let oldStatus = certificates[i].status;
      certificates[i].status = newStatus;
      addAuditLog("Status Updated", certId + " changed from " + oldStatus + " to " + newStatus);
      break;
    }
  }
  updateStats();
  renderRecordsTable();
}

// Render Records Table
function renderRecordsTable() {
  let tbody = document.getElementById("recordsTableBody");
  tbody.innerHTML = "";

  for (let i = 0; i < certificates.length; i++) {
    let cert = certificates[i];
    let privacyList = [];
    if (cert.hideRoll) privacyList.push("Hide Roll");
    if (cert.maskName) privacyList.push("Mask Name");
    if (privacyList.length === 0) privacyList.push("Public");

    let badgeClass = "badge-valid";
    if (cert.status === "Revoked") badgeClass = "badge-revoked";
    if (cert.status === "Expired") badgeClass = "badge-expired";

    let row = document.createElement("tr");
    row.innerHTML = `
      <td><code>${cert.id}</code></td>
      <td><strong>${cert.name}</strong><br><small>${cert.roll}</small></td>
      <td>${cert.course}</td>
      <td><span class="badge ${badgeClass}">${cert.status}</span></td>
      <td>${privacyList.join(", ")}</td>
      <td>
        <select onchange="changeStatus('${cert.id}', this.value)">
          <option value="Valid" ${cert.status === "Valid" ? "selected" : ""}>Valid</option>
          <option value="Revoked" ${cert.status === "Revoked" ? "selected" : ""}>Revoked</option>
          <option value="Expired" ${cert.status === "Expired" ? "selected" : ""}>Expired</option>
        </select>
      </td>
    `;
    tbody.appendChild(row);
  }
}

// Render Audit Log Table
function renderAuditLog() {
  let tbody = document.getElementById("auditTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  for (let i = 0; i < auditLogs.length; i++) {
    let log = auditLogs[i];
    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${log.time}</td>
      <td><strong>${log.action}</strong></td>
      <td>${log.details}</td>
    `;
    tbody.appendChild(row);
  }
}
