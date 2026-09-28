const API_URL = "/api/requests";
const form = document.querySelector("#request-form");
const requestList = document.querySelector("#request-list");
const formMessage = document.querySelector("#form-message");
const descriptionInput = form.elements.description;
const statusFilter = document.querySelector("#status-filter");
const searchInput = document.querySelector("#search-input");
let requests = [];
let editingId = null;

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
}).format(new Date()).toUpperCase();

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(dateString));
}

function renderRequests() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;
  const visibleRequests = requests.filter((request) => {
    const matchesStatus = selectedStatus === "All" || request.status === selectedStatus;
    const searchable = `${request.studentName} ${request.email} ${request.category} ${request.description}`.toLowerCase();
    return matchesStatus && searchable.includes(query);
  });

  document.querySelector("#request-total").textContent = requests.length;
  document.querySelector("#open-count").textContent = requests.filter((request) => request.status === "Open").length;
  document.querySelector("#progress-count").textContent = requests.filter((request) => request.status === "In progress").length;
  document.querySelector("#resolved-count").textContent = requests.filter((request) => request.status === "Resolved").length;

  if (!visibleRequests.length) {
    const hasRequests = requests.length > 0;
    requestList.innerHTML = `<div class="empty-state"><span class="empty-mark">${hasRequests ? "⌕" : "+"}</span><strong>${hasRequests ? "No matching requests" : "Nothing in the queue yet"}</strong><small>${hasRequests ? "Try another search or status filter." : "Your submitted request will appear here."}</small></div>`;
    return;
  }

  requestList.innerHTML = visibleRequests.map((request, index) => `
    <article class="request-card" style="animation-delay:${Math.min(index * 35, 210)}ms">
      <div class="request-card-main">
        <div class="request-card-top">
          <span class="category-label">${escapeHtml(request.category)}</span>
          <span class="priority-badge priority-${escapeHtml(request.priority.toLowerCase())}">${escapeHtml(request.priority)}</span>
        </div>
        <h3>${escapeHtml(request.studentName)}</h3>
        <span class="request-email">${escapeHtml(request.email)}</span>
        <p class="request-description">${escapeHtml(request.description)}</p>
        <div class="request-card-bottom">
          <select class="status-select status-${escapeHtml(request.status.toLowerCase().replaceAll(" ", "-"))}" data-status-id="${request.id}" aria-label="Update status for ${escapeHtml(request.studentName)}">
            ${["Open", "In progress", "Resolved"].map((status) => `<option${request.status === status ? " selected" : ""}>${status}</option>`).join("")}
          </select>
          <span>·</span><time datetime="${escapeHtml(request.createdAt)}">${formatDate(request.createdAt)}</time>
        </div>
      </div>
      <div class="card-actions">
        <button class="card-action" type="button" data-edit-id="${request.id}" aria-label="Edit request from ${escapeHtml(request.studentName)}" title="Edit request"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m13.5 4.5 2 2M4 16l3.8-.8L16 7a1.4 1.4 0 0 0-2-2l-8.2 8.2L4 16Z"/></svg></button>
        <button class="card-action delete" type="button" data-delete-id="${request.id}" aria-label="Delete request from ${escapeHtml(request.studentName)}" title="Delete request"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M8 6V4h4v2m3 0-.7 10H5.7L5 6m3 3v4m4-4v4"/></svg></button>
      </div>
    </article>
  `).join("");
}

async function loadRequests() {
  requestList.innerHTML = '<div class="loading-state"><span class="loader"></span> Loading requests...</div>';
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Could not load requests.");
    requests = await response.json();
    renderRequests();
  } catch (error) {
    requestList.innerHTML = `<div class="error-state"><strong>${escapeHtml(error.message)}</strong><button type="button" id="retry-button">Try again</button></div>`;
    document.querySelector("#retry-button").addEventListener("click", loadRequests);
  }
}

function resetForm() {
  form.reset();
  form.elements.priority.value = "Medium";
  editingId = null;
  document.querySelector("#form-title").textContent = "Submit a request";
  document.querySelector("#submit-label").textContent = "Send request";
  document.querySelector("#cancel-edit").hidden = true;
  document.querySelector("#character-count").textContent = "0";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const requestData = Object.fromEntries(new FormData(form).entries());
  const submitButton = form.querySelector(".submit-button");
  submitButton.disabled = true;
  formMessage.textContent = "";
  formMessage.classList.remove("error");

  try {
    const response = await fetch(editingId ? `${API_URL}/${editingId}` : API_URL, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Could not save this request.");
    const wasEditing = editingId !== null;
    resetForm();
    await loadRequests();
    formMessage.textContent = wasEditing ? "Request updated." : "Request sent. We'll take it from here.";
    window.setTimeout(() => { formMessage.textContent = ""; }, 4000);
  } catch (error) {
    formMessage.textContent = error.message;
    formMessage.classList.add("error");
  } finally {
    submitButton.disabled = false;
  }
});

descriptionInput.addEventListener("input", () => {
  document.querySelector("#character-count").textContent = descriptionInput.value.length;
});

document.querySelector("#cancel-edit").addEventListener("click", resetForm);
document.querySelector("#refresh-button").addEventListener("click", loadRequests);
statusFilter.addEventListener("change", renderRequests);
searchInput.addEventListener("input", renderRequests);

requestList.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-id]");
  const deleteButton = event.target.closest("[data-delete-id]");

  if (editButton) {
    const request = requests.find((item) => item.id === Number(editButton.dataset.editId));
    if (!request) return;
    editingId = request.id;
    for (const field of ["studentName", "email", "category", "description", "priority"]) {
      form.elements[field].value = request[field];
    }
    document.querySelector("#character-count").textContent = request.description.length;
    document.querySelector("#form-title").textContent = "Update request";
    document.querySelector("#submit-label").textContent = "Save changes";
    document.querySelector("#cancel-edit").hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    form.elements.studentName.focus({ preventScroll: true });
  }

  if (deleteButton) {
    const request = requests.find((item) => item.id === Number(deleteButton.dataset.deleteId));
    if (!request || !window.confirm(`Delete the request from ${request.studentName}?`)) return;
    deleteButton.disabled = true;
    try {
      const response = await fetch(`${API_URL}/${request.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not delete this request.");
      if (editingId === request.id) resetForm();
      await loadRequests();
    } catch (error) {
      window.alert(error.message);
      deleteButton.disabled = false;
    }
  }
});

requestList.addEventListener("change", async (event) => {
  const statusSelect = event.target.closest("[data-status-id]");
  if (!statusSelect) return;
  const request = requests.find((item) => item.id === Number(statusSelect.dataset.statusId));
  if (!request) return;

  statusSelect.disabled = true;
  try {
    const response = await fetch(`${API_URL}/${request.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: statusSelect.value }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Could not update status.");
    request.status = result.status;
    request.updatedAt = result.updatedAt;
    renderRequests();
  } catch (error) {
    window.alert(error.message);
    statusSelect.disabled = false;
  }
});

loadRequests();