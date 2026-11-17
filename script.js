const API = "http://localhost:5000";

let loginType = "student";

let currentStudent = null;

// STUDENT LOGIN

function studentLogin() {

    loginType = "student";

    document.getElementById("loginTitle").innerText = "Student Login";
    document.getElementById("loginId").placeholder = "Student ID";

    document.getElementById("registerLink").style.display = "block";

    showLoginPage();

}

// TEACHER LOGIN

function teacherLogin() {

    loginType = "teacher";

    document.getElementById("loginTitle").innerText = "Teacher Login";
    document.getElementById("loginId").placeholder = "Teacher ID";

    document.getElementById("registerLink").style.display = "none";

    showLoginPage();

}

// SHOW LOGIN

function showLoginPage() {

    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("registerForm").classList.add("hidden");

}

// SHOW REGISTER

function showRegister() {

    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("registerForm").classList.remove("hidden");

}

// REGISTRATION

document.getElementById("registerForm").onsubmit = async function(e) {

    e.preventDefault();

    try {

        const response = await fetch(API + "/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                password: document.getElementById("password").value

            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        alert(
            "Registration Successful!\nYour Student ID: " +
            data.studentId
        );

        document.getElementById("registerForm").reset();

        studentLogin();

        document.getElementById("loginId").value = data.studentId;

    } catch(error) {

        alert(error.message);

    }

};

// LOGIN

document.getElementById("loginForm").onsubmit = async function(e) {

    e.preventDefault();

    const id = document.getElementById("loginId").value;
    const password = document.getElementById("loginPassword").value;

    let url;
    let body;

    if (loginType === "student") {

        url = "/student-login";

        body = {
            studentId: id,
            password: password
        };

    } else {

        url = "/teacher-login";

        body = {
            teacherId: id,
            password: password
        };

    }

    try {

        const response = await fetch(API + url, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(body)

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        document.getElementById("loginPage").classList.add("hidden");

        if (loginType === "student") {

            currentStudent = data.student;

            loadStudent();

        } else {

            document.getElementById("teacherDashboard").classList.remove("hidden");

            loadTeacher();

        }

    } catch(error) {

        alert(error.message);

    }

};

// STUDENT DASHBOARD

async function loadStudent() {

    try {

        const response = await fetch(
            API + "/student/" + currentStudent.studentId
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        currentStudent = data.student;

        document.getElementById("studentDashboard").classList.remove("hidden");

        document.getElementById("studentName").innerText =
            "Welcome " + data.student.name;

        document.getElementById("studentId").innerText =
            "Student ID: " + data.student.studentId;

        document.getElementById("casual").innerText =
            data.student.casualLeave;

        document.getElementById("medical").innerText =
            data.student.medicalLeave;

        const tbody = document.getElementById("myLeaves");

        tbody.innerHTML = "";

        data.leaves.forEach(leave => {

            tbody.innerHTML += `

                <tr>
                    <td>${escapeHTML(leave.leaveType)}</td>
                    <td>${escapeHTML(leave.fromDate)}</td>
                    <td>${escapeHTML(leave.toDate)}</td>
                    <td>${leave.days}</td>
                    <td>${escapeHTML(leave.reason)}</td>
                    <td class="${leave.status}">${leave.status}</td>
                </tr>

            `;

        });

        if (data.leaves.length === 0) {
            tbody.innerHTML = "<tr><td colspan='6'>No Applications</td></tr>";
        }

    } catch(error) {

        alert(error.message);

    }

}

// APPLY LEAVE

document.getElementById("leaveForm").onsubmit = async function(e) {

    e.preventDefault();

    try {

        const from = document.getElementById("fromDate").value;
        const to = document.getElementById("toDate").value;

        const response = await fetch(API + "/apply-leave", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                studentId: currentStudent.studentId,

                leaveType: document.getElementById("leaveType").value,

                fromDate: from,

                toDate: to,

                reason: document.getElementById("reason").value

            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        alert(data.message);

        document.getElementById("leaveForm").reset();

        loadStudent();

    } catch(error) {

        alert(error.message);

    }

};

// TEACHER DASHBOARD

async function loadTeacher() {

    try {

        const response = await fetch(API + "/all-leaves");

        const leaves = await response.json();

        if (!response.ok) {
            throw new Error(leaves.message);
        }

        const tbody = document.getElementById("allLeaves");

        tbody.innerHTML = "";

        leaves.forEach(leave => {

            let action = "";

            if (leave.status === "Pending") {

                action = `

                    <button class="approve"
                    onclick="updateLeave('${leave._id}','Approved')">
                    Approve
                    </button>

                    <button class="reject"
                    onclick="updateLeave('${leave._id}','Rejected')">
                    Reject
                    </button>

                `;

            } else {

                action = "-";

            }

            tbody.innerHTML += `

                <tr>

                    <td>${escapeHTML(leave.studentId)}</td>

                    <td>${escapeHTML(leave.studentName)}</td>

                    <td>${escapeHTML(leave.leaveType)}</td>

                    <td>${escapeHTML(leave.fromDate)}</td>

                    <td>${escapeHTML(leave.toDate)}</td>

                    <td>${leave.days}</td>

                    <td>${escapeHTML(leave.reason)}</td>

                    <td class="${leave.status}">
                        ${leave.status}
                    </td>

                    <td>${action}</td>

                </tr>

            `;

        });

        if (leaves.length === 0) {
            tbody.innerHTML = "<tr><td colspan='9'>No Applications</td></tr>";
        }

    } catch(error) {

        alert(error.message);

    }

}

// APPROVE OR REJECT

async function updateLeave(id, status) {

    if (!confirm("Are you sure you want to " + status + "?")) {
        return;
    }

    try {

        const response = await fetch(
            API + "/update-leave/" + id,
            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({ status })

            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        alert(data.message);

        loadTeacher();

    } catch(error) {

        alert(error.message);

    }

}

// SAFE TEXT DISPLAY

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

}

// LOGOUT

function logout() {

    location.reload();

}