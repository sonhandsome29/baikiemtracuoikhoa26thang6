const appState = {
  teachers: [],
  positions: [],
  teacherPagination: {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  },
};

const API_BASE_URL = "http://localhost:3000";

const refs = {
  tabs: Array.from(document.querySelectorAll(".tab-link")),
  panels: Array.from(document.querySelectorAll(".tab-panel")),
  teacherTableBody: document.getElementById("teacher-table-body"),
  teacherPaginationMeta: document.getElementById("teacher-pagination-meta"),
  teacherPageLabel: document.getElementById("teacher-page-label"),
  teacherPrev: document.getElementById("teacher-prev"),
  teacherNext: document.getElementById("teacher-next"),
  teacherForm: document.getElementById("teacher-form"),
  teacherPositionSelect: document.getElementById("teacher-position-select"),
  educationsList: document.getElementById("educations-list"),
  addEducationButton: document.getElementById("add-education"),
  positionForm: document.getElementById("position-form"),
  positionTableBody: document.getElementById("position-table-body"),
  teacherCount: document.getElementById("teacher-count"),
  positionCount: document.getElementById("position-count"),
  teacherDialog: document.getElementById("teacher-dialog"),
  teacherDialogContent: document.getElementById("teacher-dialog-content"),
  closeDialogButton: document.getElementById("close-dialog"),
  toast: document.getElementById("toast"),
  reloadTeachersButton: document.getElementById("reload-teachers"),
  reloadPositionsButton: document.getElementById("reload-positions"),
  teacherAvatarInput: document.getElementById("teacher-avatar"),
  teacherAvatarPreview: document.getElementById("teacher-avatar-preview"),
  teacherAvatarFallback: document.getElementById("teacher-avatar-fallback"),
};

let selectedTeacherAvatarDataUrl = "";

function showToast(message, isError = false) {
  refs.toast.textContent = message;
  refs.toast.style.background = isError ? "rgba(153, 27, 27, 0.94)" : "rgba(17, 24, 39, 0.92)";
  refs.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    refs.toast.classList.remove("show");
  }, 2400);
}

async function apiFetch(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Da xay ra loi khong xac dinh.");
  }

  return payload;
}

function educationTemplate(index) {
  return `
    <article class="education-item">
      <div class="education-item-header">
        <h4>Hoc van ${index + 1}</h4>
        <button type="button" class="text-button remove-education">Xoa</button>
      </div>
      <div class="education-grid">
        <label>
          <span>Bac</span>
          <input name="level" placeholder="Cu nhan / Thac si / Tien si" />
        </label>
        <label>
          <span>Truong</span>
          <input name="school" placeholder="Ten truong" />
        </label>
        <label>
          <span>Chuyen nganh</span>
          <input name="major" placeholder="Chuyen nganh" />
        </label>
        <label>
          <span>Trang thai</span>
          <input name="status" placeholder="Da tot nghiep" />
        </label>
        <label>
          <span>Tot nghiep</span>
          <input name="graduatedAt" placeholder="2020" />
        </label>
      </div>
    </article>
  `;
}

function renderEducationItems() {
  if (!refs.educationsList.children.length) {
    addEducationItem();
  }
}

function addEducationItem() {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = educationTemplate(refs.educationsList.children.length);
  const item = wrapper.firstElementChild;
  item.querySelector(".remove-education").addEventListener("click", () => {
    item.remove();
    syncEducationHeaders();
    if (!refs.educationsList.children.length) {
      addEducationItem();
    }
  });
  refs.educationsList.appendChild(item);
  syncEducationHeaders();
}

function syncEducationHeaders() {
  Array.from(refs.educationsList.children).forEach((item, index) => {
    item.querySelector("h4").textContent = `Hoc van ${index + 1}`;
  });
}

function setActiveTab(tabId) {
  refs.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabId);
  });
  refs.panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabId);
  });
}

function statusBadge(isActive) {
  return `<span class="badge ${isActive ? "success" : "inactive"}">${isActive ? "Dang cong tac" : "Ngung"}</span>`;
}

function getTeacherInitials(name) {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);

  if (!words.length) {
    return "GV";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function renderTeacherAvatar(teacher) {
  if (teacher.avatar) {
    return `<img class="teacher-thumb-image" src="${teacher.avatar}" alt="${teacher.name}" />`;
  }

  return `<div class="teacher-thumb-fallback">${getTeacherInitials(teacher.name)}</div>`;
}

function resetTeacherAvatarPreview() {
  selectedTeacherAvatarDataUrl = "";
  refs.teacherAvatarPreview.src = "";
  refs.teacherAvatarPreview.classList.add("hidden");
  refs.teacherAvatarFallback.classList.remove("hidden");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Khong doc duoc anh."));
    reader.readAsDataURL(file);
  });
}

function renderTeachers() {
  if (!appState.teachers.length) {
    refs.teacherTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="muted">Chua co giao vien nao.</td>
      </tr>
    `;
  } else {
    refs.teacherTableBody.innerHTML = appState.teachers
      .map((teacher) => {
        const highestEducation = teacher.highestEducation || {};
        return `
          <tr>
            <td>${teacher.code}</td>
            <td class="teacher-cell">
              <div class="teacher-cell-header">
                ${renderTeacherAvatar(teacher)}
                <div>
                  <strong>${teacher.name}</strong>
                  <small>${teacher.email}</small><br />
                  <small>${teacher.phoneNumber}</small>
                </div>
              </div>
            </td>
            <td class="education-cell">
              <strong>${highestEducation.level || "N/A"}</strong>
              <small>${highestEducation.major || "Chua cap nhat chuyen nganh"}</small><br />
              <small>${highestEducation.school || "Chua cap nhat truong hoc"}</small>
            </td>
            <td>${teacher.role === "TEACHER" ? "N/A" : teacher.role}</td>
            <td>${teacher.teacherPosition?.name || "N/A"}</td>
            <td>${teacher.address}</td>
            <td>${statusBadge(teacher.isActive)}</td>
            <td><button class="action-button" data-teacher-id="${teacher.id}">Chi tiet</button></td>
          </tr>
        `;
      })
      .join("");
  }

  refs.teacherPaginationMeta.textContent = `Tong: ${appState.teacherPagination.totalItems} giao vien - ${appState.teacherPagination.limit} / trang`;
  refs.teacherPageLabel.textContent = `${appState.teacherPagination.page} / ${appState.teacherPagination.totalPages}`;
  refs.teacherPrev.disabled = appState.teacherPagination.page <= 1;
  refs.teacherNext.disabled = appState.teacherPagination.page >= appState.teacherPagination.totalPages;

  refs.teacherTableBody.querySelectorAll("[data-teacher-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      await openTeacherDialog(button.dataset.teacherId);
    });
  });
}

function renderPositions() {
  if (!appState.positions.length) {
    refs.positionTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="muted">Chua co vi tri cong tac nao.</td>
      </tr>
    `;
    return;
  }

  refs.positionTableBody.innerHTML = appState.positions
    .map(
      (position, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${position.code}</td>
          <td>${position.name}</td>
          <td>${statusBadge(position.isActive)}</td>
          <td>${position.des}</td>
        </tr>
      `
    )
    .join("");
}

function renderTeacherPositionOptions() {
  refs.teacherPositionSelect.innerHTML = appState.positions
    .map(
      (position) =>
        `<option value="${position.id}">${position.code} - ${position.name}</option>`
    )
    .join("");
}

async function fetchTeachers(page = 1) {
  const payload = await apiFetch(`/teachers?page=${page}&limit=${appState.teacherPagination.limit}`);
  appState.teachers = payload.data;
  appState.teacherPagination = payload.pagination;
  refs.teacherCount.textContent = payload.pagination.totalItems;
  renderTeachers();
}

async function fetchPositions() {
  const payload = await apiFetch("/teacher-positions");
  appState.positions = payload.data;
  refs.positionCount.textContent = payload.data.length;
  renderTeacherPositionOptions();
  renderPositions();
}

function collectEducations() {
  return Array.from(refs.educationsList.querySelectorAll(".education-item")).map((item) => ({
    level: item.querySelector('[name="level"]').value.trim(),
    school: item.querySelector('[name="school"]').value.trim(),
    major: item.querySelector('[name="major"]').value.trim(),
    status: item.querySelector('[name="status"]').value.trim(),
    graduatedAt: item.querySelector('[name="graduatedAt"]').value.trim(),
  }));
}

async function openTeacherDialog(teacherId) {
  const payload = await apiFetch(`/teachers/${teacherId}`);
  const teacher = payload.data;
  const educations = teacher.educations?.length
    ? teacher.educations
        .map(
          (education) => `
            <div class="dialog-block">
              <strong>${education.level || "N/A"} - ${education.major || "Chua cap nhat"}</strong>
              <div>${education.school || "Chua cap nhat truong"}</div>
              <div class="muted">${education.status || "Chua cap nhat"} | Tot nghiep: ${education.graduatedAt || "N/A"}</div>
            </div>
          `
        )
        .join("")
    : `<div class="dialog-block">Chua co hoc van.</div>`;

  refs.teacherDialogContent.innerHTML = `
    <div class="teacher-dialog-profile">
      ${teacher.avatar ? `<img class="teacher-dialog-image" src="${teacher.avatar}" alt="${teacher.name}" />` : `<div class="teacher-dialog-fallback">${getTeacherInitials(teacher.name)}</div>`}
    </div>
    <div class="dialog-grid">
      <div class="dialog-block">
        <strong>Thong tin chung</strong>
        <div>Ma: ${teacher.code}</div>
        <div>Ten: ${teacher.name}</div>
        <div>Email: ${teacher.email}</div>
        <div>So dien thoai: ${teacher.phoneNumber}</div>
      </div>
      <div class="dialog-block">
        <strong>Cong tac</strong>
        <div>Vi tri: ${teacher.teacherPosition?.name || "N/A"}</div>
        <div>Dia chi: ${teacher.address}</div>
        <div>CCCD: ${teacher.identity}</div>
        <div>Ngay sinh: ${teacher.dob}</div>
      </div>
    </div>
    <div class="panel-head compact" style="margin-top:16px">
      <div>
        <h3>Hoc van</h3>
      </div>
    </div>
    <div class="education-list">${educations}</div>
  `;

  refs.teacherDialog.showModal();
}

async function handleTeacherSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const payload = {
    avatar: selectedTeacherAvatarDataUrl,
    name: formData.get("name"),
    dob: formData.get("dob"),
    phoneNumber: formData.get("phoneNumber"),
    email: formData.get("email"),
    identity: formData.get("identity"),
    address: formData.get("address"),
    teacherPositionId: formData.get("teacherPositionId"),
    isActive: formData.get("isActive") === "true",
    educations: collectEducations(),
  };

  try {
    await apiFetch("/teachers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    refs.teacherForm.reset();
    refs.educationsList.innerHTML = "";
    resetTeacherAvatarPreview();
    addEducationItem();
    await Promise.all([fetchTeachers(1), fetchPositions()]);
    setActiveTab("teachers-list");
    showToast("Da tao giao vien thanh cong.");
  } catch (error) {
    showToast(error.message, true);
  }
}

async function handlePositionSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const payload = {
    code: formData.get("code"),
    name: formData.get("name"),
    des: formData.get("des"),
    isActive: formData.get("isActive") === "true",
  };

  try {
    await apiFetch("/teacher-positions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    refs.positionForm.reset();
    await fetchPositions();
    setActiveTab("positions-list");
    showToast("Da tao vi tri cong tac thanh cong.");
  } catch (error) {
    showToast(error.message, true);
  }
}

function bindEvents() {
  refs.tabs.forEach((tab) => {
    tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
  });

  refs.addEducationButton.addEventListener("click", addEducationItem);
  refs.teacherForm.addEventListener("submit", handleTeacherSubmit);
  refs.positionForm.addEventListener("submit", handlePositionSubmit);
  refs.teacherPrev.addEventListener("click", () => fetchTeachers(appState.teacherPagination.page - 1));
  refs.teacherNext.addEventListener("click", () => fetchTeachers(appState.teacherPagination.page + 1));
  refs.closeDialogButton.addEventListener("click", () => refs.teacherDialog.close());
  refs.reloadTeachersButton.addEventListener("click", () => fetchTeachers(appState.teacherPagination.page));
  refs.reloadPositionsButton.addEventListener("click", fetchPositions);
  refs.teacherAvatarInput.addEventListener("change", async (event) => {
    const [file] = event.currentTarget.files || [];

    if (!file) {
      resetTeacherAvatarPreview();
      return;
    }

    try {
      selectedTeacherAvatarDataUrl = await readFileAsDataUrl(file);
      refs.teacherAvatarPreview.src = selectedTeacherAvatarDataUrl;
      refs.teacherAvatarPreview.classList.remove("hidden");
      refs.teacherAvatarFallback.classList.add("hidden");
    } catch (error) {
      resetTeacherAvatarPreview();
      showToast(error.message, true);
    }
  });
}

async function bootstrap() {
  bindEvents();
  renderEducationItems();

  try {
    await fetchPositions();
    await fetchTeachers(1);
  } catch (error) {
    showToast(error.message, true);
  }
}

bootstrap();
