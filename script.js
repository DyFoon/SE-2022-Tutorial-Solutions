//Array initialization
let allCourses = [];      // all Course objects loaded from courses.json
let filteredCourses = []; // currently displayed courses

//DOM commands
const fileInput = document.getElementById("fileInput");
const fileNameSpan = document.getElementById("fileName");
const errorDiv = document.getElementById("errorMessage");
const deptSelect = document.getElementById("filterDepartment");
const levelSelect = document.getElementById("filterLevel");
const creditsSelect = document.getElementById("filterCredits");
const instructorSelect = document.getElementById("filterInstructor");
const sortSelect = document.getElementById("sortBy");
const listDiv = document.getElementById("courseList");
const detailsDiv = document.getElementById("courseDetails");

//Course Class
class Course {
  constructor(obj) {
    // expecting these properties in the JSON objects
    this.id = obj.id;
    this.title = obj.title;
    this.department = obj.department;
    this.level = obj.level;
    this.credits = obj.credits;
    this.instructor = obj.instructor;
    this.semester = obj.semester;  
    this.description = obj.description; 
  }

  // Returns HTML string for the right-hand details panel
  getDetailsHtml() {
    return `
      <div class="course-details">
        <h3>${this.id}</h3>
        <p><strong>Title:</strong> ${this.title ?? "N/A"}</p>
        <p><strong>Department:</strong> ${this.department ?? "N/A"}</p>
        <p><strong>Level:</strong> ${this.level ?? "N/A"}</p>
        <p><strong>Credits:</strong> ${this.credits ?? "N/A"}</p>
        <p><strong>Instructor:</strong> ${this.instructor ?? "N/A"}</p>
        <p><strong>Semester:</strong> ${this.semester ?? "N/A"}</p>
        <p>${this.description ?? ""}</p>
      </div>
    `;
  }
}

//Error displays
function showError(msg) {
  errorDiv.textContent = msg;
}
function clearError() {
  errorDiv.textContent = "";
}

//Option to upload json files for course info
fileInput.addEventListener("change", handleFileSelect);
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  fileNameSpan.textContent = file.name;

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const text = e.target.result;
      const data = JSON.parse(text); // may throw error

      if (!Array.isArray(data)) {
        throw new Error("JSON root is not an array");
      }

      //converts objects to course instances
      allCourses = data.map(obj => new Course(obj));
      clearError();

      populateFilterDropdowns();
      applyFiltersAndSort();
    } catch (err) {
      console.error(err);
      showError("Invalid JSON file format.");
      allCourses = [];
      filteredCourses = [];
      renderCourseList();
      renderCourseDetails(null);
    }
  };

  reader.onerror = function () {
    showError("Error reading file.");
  };

  reader.readAsText(file);
}

//Filter options for the data
function populateFilterDropdowns() {
  const deptSet = new Set();
  const levelSet = new Set();
  const creditsSet = new Set();
  const instructorSet = new Set();

  allCourses.forEach(course => {
    if (course.department) deptSet.add(course.department);
    if (course.level !== undefined && course.level !== null) {
      levelSet.add(String(course.level));
    }
    if (course.credits !== undefined && course.credits !== null) {
      creditsSet.add(String(course.credits));
    }
    if (course.instructor) instructorSet.add(course.instructor);
  });

  fillSelect(deptSelect, deptSet);
  fillSelect(levelSelect, levelSet);
  fillSelect(creditsSelect, creditsSet);
  fillSelect(instructorSelect, instructorSet);
}

//Selecting a specific course trait for filtering
function fillSelect(selectElem, valueSet) {
  const prevValue = selectElem.value;

  selectElem.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = "All";
  optAll.textContent = "All";
  selectElem.appendChild(optAll);

  Array.from(valueSet)
    .sort()
    .forEach(v => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      selectElem.appendChild(opt);
    });

  // keep previous selection if it still exists
  let exists = false;

  for (let i = 0; i < selectElem.options.length; i++) {
    if (selectElem.options[i].value === prevValue) {
    exists = true;
    break; // stop checking once found
    }
  }

  if (exists) {
    selectElem.value = prevValue;
  } else {
  selectElem.value = "All";
    }
}

//Selection options
[
  deptSelect,
  levelSelect,
  creditsSelect,
  instructorSelect,
  sortSelect
].forEach(sel => {
  sel.addEventListener("change", applyFiltersAndSort);
});

//applying filters and sorting
function applyFiltersAndSort() {
  if (!allCourses.length) {
    renderCourseList();
    renderCourseDetails(null);
    return;
  }

  const deptVal = deptSelect.value;
  const levelVal = levelSelect.value;
  const creditsVal = creditsSelect.value;
  const instrVal = instructorSelect.value;

  //Filtering using Array.filter
  let result = allCourses.filter(course => {
    //course department checkiing
    if (deptVal !== "All" && course.department !== deptVal) {
      return false;
    }
    //checking for course level
    if (levelVal !== "All" && String(course.level) !== levelVal) {
      return false;
    }
    //checking for specified credits
    if (creditsVal !== "All" && String(course.credits) !== creditsVal) {
      return false;
    }
    //chekcing for specified instructor
    if (instrVal !== "All" && course.instructor !== instrVal) {
      return false;
    }
    return true;
  });

  //Sorting options
  const sortVal = sortSelect.value;

    if (sortVal === "id-asc") {
    result.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  } else if (sortVal === "id-desc") {
    result.sort((a, b) => (a.id > b.id ? -1 : a.id < b.id ? 1 : 0));

  } else if (sortVal === "title-asc") {
    result.sort((a, b) => (a.title < b.title ? -1 : a.title > b.title ? 1 : 0));

  } else if (sortVal === "title-desc") {
    result.sort((a, b) => (a.title > b.title ? -1 : a.title < b.title ? 1 : 0));

  } else if (sortVal === "semester-asc") {
    result.sort(
      (a, b) => semesterToNumber(a.semester) - semesterToNumber(b.semester)
    );

  } else if (sortVal === "semester-desc") {
    result.sort(
      (a, b) => semesterToNumber(b.semester) - semesterToNumber(a.semester)
    );
  }
  

  filteredCourses = result;
  renderCourseList();

  if (filteredCourses.length > 0) {
    renderCourseDetails(filteredCourses[0]);
  } else {
    renderCourseDetails(null);
  }
}

//Turning year and season into a number for chronological sorting
function semesterToNumber(sem) {
  if (!sem || typeof sem !== "string") {
    return Number.MAX_SAFE_INTEGER;
  }

  const parts = sem.trim().split(/\s+/); //splitting into season and year
  if (parts.length !== 2) {
    //if semester/year is invalid, push to back of list
    return Number.MAX_SAFE_INTEGER;
  }

  const season = parts[0];
  const year = parseInt(parts[1], 10);

  const seasonOrder = {
    "Winter": 1,
    "Spring": 2,
    "Summer": 3,
    "Fall":   4
  };

  const s = seasonOrder[season] ?? 0;
  if (isNaN(year)) {
    return Number.MAX_SAFE_INTEGER;
  }

  //easier filtering and display, so that year is in front
  return year * 10 + s;
}

//filtering for each list
function renderCourseList() {
  listDiv.innerHTML = "";

  if (!filteredCourses.length) {
    listDiv.textContent = "No courses to display.";
    return;
  }

  filteredCourses.forEach(course => {
    const item = document.createElement("div");
    item.className = "course-item";
    item.textContent = course.id; // left column shows ID
    item.addEventListener("click", () => renderCourseDetails(course));
    listDiv.appendChild(item);
  });
}

function renderCourseDetails(course) {
  if (!course) {
    detailsDiv.innerHTML = "<p>No course selected.</p>";
  } else {
    detailsDiv.innerHTML = course.getDetailsHtml();
  }
}