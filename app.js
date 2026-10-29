/**
 * app.js — Student Course Management System
 * COS201 Programming I — Mid-Semester Lab Assessment
 *
 * Demonstrates:
 *   - Classes and objects (Course, CourseManager)
 *   - Methods for each operation
 *   - Loops / iteration
 *   - Recursion (recursive search & recursive unit count)
 *   - Exception / error handling (try-catch)
 *   - String processing (trim, toUpperCase, validation)
 *   - File reading & writing (Blob download / FileReader upload)
 *   - GUI-based interface with menu navigation
 */

// ============================================================
// 1. COURSE CLASS
// ============================================================

/**
 * Represents a single course with a code, title, and credit unit.
 */
class Course {
    /**
     * Create a Course.
     * @param {string} code  - Unique course code (e.g. "COS201").
     * @param {string} title - Descriptive course title.
     * @param {number} unit  - Number of credit units (positive integer).
     */
    constructor(code, title, unit) {
        // String processing: trim whitespace and normalise casing
        this.code = code.trim().toUpperCase();
        this.title = title.trim();
        this.unit = parseInt(unit, 10);
    }

    /**
     * Convert the course to a CSV-formatted string for file storage.
     * @returns {string}
     */
    toCSV() {
        return `${this.code},${this.title},${this.unit}`;
    }

    /**
     * Create a Course from a CSV line.
     * @param {string} line - CSV line "CODE,Title,Unit".
     * @returns {Course}
     * @throws {Error} If the line format is invalid.
     */
    static fromCSV(line) {
        const parts = line.trim().split(",");
        if (parts.length !== 3) {
            throw new Error(`Invalid course data: "${line}"`);
        }
        const unit = parseInt(parts[2], 10);
        if (isNaN(unit) || unit <= 0) {
            throw new Error(`Invalid unit value in: "${line}"`);
        }
        return new Course(parts[0], parts[1], unit);
    }
}

// ============================================================
// 2. COURSE MANAGER CLASS
// ============================================================

/** Key used to persist courses in the browser's localStorage. */
const STORAGE_KEY = "cos201_courses";

/**
 * Manages an array of Course objects and provides all
 * required operations: add, view, search, compute, save, load.
 */
class CourseManager {
    constructor() {
        /** @type {Course[]} Internal list of courses */
        this.courses = [];
        // Restore any previously saved courses from localStorage
        this.loadFromStorage();
    }

    // ---- Local Storage Persistence ----

    /**
     * Save the current course list to localStorage.
     */
    saveToStorage() {
        try {
            const data = this.courses.map(c => ({
                code: c.code,
                title: c.title,
                unit: c.unit
            }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (err) {
            console.warn("Could not save to localStorage:", err.message);
        }
    }

    /**
     * Load the course list from localStorage (if available).
     */
    loadFromStorage() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                for (const item of data) {
                    this.courses.push(new Course(item.code, item.title, item.unit));
                }
            }
        } catch (err) {
            console.warn("Could not load from localStorage:", err.message);
        }
    }

    // ---- Add ----

    /**
     * Add a new course after validation.
     * @param {string} code
     * @param {string} title
     * @param {number} unit
     * @throws {Error} If inputs are invalid or course code already exists.
     */
    addCourse(code, title, unit) {
        // Validate inputs
        if (!code || code.trim().length === 0) {
            throw new Error("Course code cannot be empty.");
        }
        if (!title || title.trim().length === 0) {
            throw new Error("Course title cannot be empty.");
        }
        const parsedUnit = parseInt(unit, 10);
        if (isNaN(parsedUnit) || parsedUnit <= 0) {
            throw new Error("Credit units must be a positive number.");
        }

        // Check for duplicates (uses iteration / loop)
        const upperCode = code.trim().toUpperCase();
        for (let i = 0; i < this.courses.length; i++) {
            if (this.courses[i].code === upperCode) {
                throw new Error(`A course with code "${upperCode}" already exists.`);
            }
        }

        const course = new Course(code, title, parsedUnit);
        this.courses.push(course);
        this.saveToStorage();
        return course;
    }

    // ---- Delete ----

    /**
     * Remove a course by its code.
     * @param {string} code
     */
    removeCourse(code) {
        const upperCode = code.trim().toUpperCase();
        this.courses = this.courses.filter(c => c.code !== upperCode);
        this.saveToStorage();
    }

    // ---- View (iteration) ----

    /**
     * Return all courses (iteration over the internal structure).
     * @returns {Course[]}
     */
    getAllCourses() {
        return this.courses;
    }

    // ---- Search (RECURSIVE) ----

    /**
     * Recursively search for a course by its code.
     * This satisfies the "use of a simple recursive feature" requirement.
     *
     * @param {string} code  - The code to search for.
     * @param {number} index - Current index in the array (default 0).
     * @returns {Course|null} The matching course, or null if not found.
     */
    searchByCode(code, index = 0) {
        // Base case: reached end of array without finding a match
        if (index >= this.courses.length) {
            return null;
        }
        // Check current element
        if (this.courses[index].code === code.trim().toUpperCase()) {
            return this.courses[index];
        }
        // Recursive case: search the rest of the array
        return this.searchByCode(code, index + 1);
    }

    // ---- Compute Total Units (RECURSIVE) ----

    /**
     * Recursively compute the total credit units of all courses.
     * Another application of recursion as required by the assessment.
     *
     * @param {number} index - Current index (default 0).
     * @returns {number} Total credit units.
     */
    computeTotalUnits(index = 0) {
        // Base case
        if (index >= this.courses.length) {
            return 0;
        }
        // Recursive case: current unit + rest
        return this.courses[index].unit + this.computeTotalUnits(index + 1);
    }

    // ---- Save to File ----

    /**
     * Serialize all courses to a CSV string for file download.
     * @returns {string}
     * @throws {Error} If there are no courses to save.
     */
    toFileContent() {
        if (this.courses.length === 0) {
            throw new Error("No courses to save. Add some courses first.");
        }
        // Header line + each course as CSV
        let content = "Code,Title,Units\n";
        for (const course of this.courses) {
            content += course.toCSV() + "\n";
        }
        return content;
    }

    // ---- Load from File ----

    /**
     * Load courses from file content string.
     * @param {string} text - Raw text content from a file.
     * @returns {number} Number of courses loaded.
     * @throws {Error} If file is empty or contains only invalid data.
     */
    loadFromFileContent(text) {
        if (!text || text.trim().length === 0) {
            throw new Error("The selected file is empty.");
        }

        const lines = text.trim().split("\n");
        let loaded = 0;
        let errors = [];

        // Skip the header line if it looks like one
        const startIndex = (lines[0].toLowerCase().includes("code") &&
            lines[0].toLowerCase().includes("title")) ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
            try {
                const course = Course.fromCSV(lines[i]);
                // Avoid duplicates
                const exists = this.searchByCode(course.code) !== null;
                if (!exists) {
                    this.courses.push(course);
                    loaded++;
                }
            } catch (err) {
                errors.push(`Line ${i + 1}: ${err.message}`);
            }
        }

        if (loaded === 0 && errors.length > 0) {
            throw new Error("No valid courses found in file.\n" + errors.join("\n"));
        }

        this.saveToStorage();
        return loaded;
    }
}

// ============================================================
// 3. USER INTERFACE CONTROLLER
// ============================================================

/**
 * Controls all DOM interactions and connects the UI to
 * the CourseManager logic.
 */
class AppController {
    constructor() {
        this.manager = new CourseManager();
        this.initElements();
        this.bindEvents();
        this.refreshBadge();
    }

    /** Cache frequently-used DOM elements. */
    initElements() {
        // Menu buttons
        this.menuButtons = document.querySelectorAll(".menu-btn");
        // Views
        this.views = document.querySelectorAll(".view");

        // Add form
        this.addForm = document.getElementById("add-form");
        this.inputCode = document.getElementById("input-code");
        this.inputTitle = document.getElementById("input-title");
        this.inputUnit = document.getElementById("input-unit");
        this.addFeedback = document.getElementById("add-feedback");

        // Table
        this.tbody = document.getElementById("course-tbody");
        this.emptyMsg = document.getElementById("empty-msg");

        // Search
        this.searchForm = document.getElementById("search-form");
        this.searchInput = document.getElementById("search-input");
        this.searchResult = document.getElementById("search-result");

        // Stats
        this.statUnits = document.getElementById("stat-units");
        this.statCount = document.getElementById("stat-count");

        // Save / Load
        this.saveBtn = document.getElementById("do-save");
        this.saveFeedback = document.getElementById("save-feedback");
        this.fileInput = document.getElementById("file-input");
        this.loadFeedback = document.getElementById("load-feedback");

        // Badge
        this.totalUnitsEl = document.getElementById("total-units");
    }

    /** Attach event listeners. */
    bindEvents() {
        // Menu navigation
        this.menuButtons.forEach(btn => {
            btn.addEventListener("click", () => this.switchView(btn));
        });

        // Add course
        this.addForm.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleAdd();
        });

        // Search
        this.searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleSearch();
        });

        // Save
        this.saveBtn.addEventListener("click", () => this.handleSave());

        // Load
        this.fileInput.addEventListener("change", (e) => this.handleLoad(e));
    }

    // ---- Navigation ----

    /**
     * Switch between views based on the button's data-view attribute.
     * @param {HTMLElement} activeBtn
     */
    switchView(activeBtn) {
        const targetId = activeBtn.dataset.view;

        // Update button states
        this.menuButtons.forEach(b => b.classList.remove("active"));
        activeBtn.classList.add("active");

        // Show target view, hide others
        this.views.forEach(v => {
            v.classList.toggle("active", v.id === targetId);
        });

        // Refresh data in the target view
        if (targetId === "list-view") this.renderTable();
        if (targetId === "units-view") this.renderStats();
    }

    // ---- Add Course ----

    handleAdd() {
        try {
            const course = this.manager.addCourse(
                this.inputCode.value,
                this.inputTitle.value,
                this.inputUnit.value
            );
            this.showFeedback(this.addFeedback, "success",
                `✅ Course "${course.code} — ${course.title}" added successfully!`);
            this.addForm.reset();
            this.inputCode.focus();
            this.refreshBadge();
        } catch (err) {
            this.showFeedback(this.addFeedback, "error", `❌ ${err.message}`);
        }
    }

    // ---- View All (Table) ----

    renderTable() {
        const courses = this.manager.getAllCourses();
        this.tbody.innerHTML = "";

        if (courses.length === 0) {
            this.emptyMsg.style.display = "block";
            return;
        }

        this.emptyMsg.style.display = "none";

        courses.forEach((c, i) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${i + 1}</td>
                <td><strong>${c.code}</strong></td>
                <td>${c.title}</td>
                <td>${c.unit}</td>
                <td><button class="delete-btn" data-code="${c.code}">Remove</button></td>
            `;
            // Attach delete handler
            tr.querySelector(".delete-btn").addEventListener("click", () => {
                this.manager.removeCourse(c.code);
                this.renderTable();
                this.refreshBadge();
            });
            this.tbody.appendChild(tr);
        });
    }

    // ---- Search ----

    handleSearch() {
        const code = this.searchInput.value.trim();
        if (!code) return;

        // Uses the recursive search method
        const found = this.manager.searchByCode(code);
        this.searchResult.classList.remove("hidden", "found", "not-found");

        if (found) {
            this.searchResult.classList.add("found");
            this.searchResult.innerHTML = `
                <h3>✅ Course Found</h3>
                <p><strong>Code:</strong> ${found.code}</p>
                <p><strong>Title:</strong> ${found.title}</p>
                <p><strong>Units:</strong> ${found.unit}</p>
            `;
        } else {
            this.searchResult.classList.add("not-found");
            this.searchResult.innerHTML = `
                <h3>❌ Not Found</h3>
                <p>No course with code "<strong>${code.toUpperCase()}</strong>" was found.</p>
            `;
        }
    }

    // ---- Compute Stats ----

    renderStats() {
        // Uses the recursive computeTotalUnits method
        const total = this.manager.computeTotalUnits();
        const count = this.manager.courses.length;

        this.statUnits.textContent = total;
        this.statCount.textContent = `across ${count} course(s)`;
    }

    // ---- Save to File ----

    handleSave() {
        try {
            const content = this.manager.toFileContent();
            const blob = new Blob([content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "my_courses.txt";
            a.click();

            URL.revokeObjectURL(url);
            this.showFeedback(this.saveFeedback, "success",
                "✅ File downloaded successfully as \"my_courses.txt\".");
        } catch (err) {
            this.showFeedback(this.saveFeedback, "error", `❌ ${err.message}`);
        }
    }

    // ---- Load from File ----

    handleLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            try {
                const loaded = this.manager.loadFromFileContent(reader.result);
                this.showFeedback(this.loadFeedback, "success",
                    `✅ Successfully loaded ${loaded} course(s) from "${file.name}".`);
                this.refreshBadge();
            } catch (err) {
                this.showFeedback(this.loadFeedback, "error", `❌ ${err.message}`);
            }
        };

        reader.onerror = () => {
            this.showFeedback(this.loadFeedback, "error",
                "❌ An error occurred while reading the file.");
        };

        reader.readAsText(file);
        // Reset input so the same file can be re-selected
        this.fileInput.value = "";
    }

    // ---- Helpers ----

    /**
     * Show a feedback message with a specific type (success / error).
     * @param {HTMLElement} el   - The feedback container element.
     * @param {string}      type - "success" or "error".
     * @param {string}      msg  - Message to display.
     */
    showFeedback(el, type, msg) {
        el.textContent = msg;
        el.className = `feedback show ${type}`;

        // Auto-hide after 5 seconds
        clearTimeout(el._timer);
        el._timer = setTimeout(() => {
            el.classList.remove("show");
        }, 5000);
    }

    /** Update the header badge with the current total units. */
    refreshBadge() {
        this.totalUnitsEl.textContent = this.manager.computeTotalUnits();
    }
}

// ============================================================
// 4. INITIALISE APPLICATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    new AppController();
});
