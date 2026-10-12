// Check whether a student has logged in.
const loggedInId = sessionStorage.getItem("studentId");

if (!loggedInId) {
    window.location.replace("index.html");
} else {
    startPortal();
}

async function startPortal() {
    const message = document.getElementById("portalMessage");
    const tableBody = document.getElementById("studentTableBody");

    try {
        // 1. Fetch the XML file.
        const response = await fetch("students.xml");

        if (!response.ok) {
            throw new Error("Could not load students.xml");
        }

        // 2. Read the response as text.
        const xmlText = await response.text();

        // 3. Convert XML text into an XML document.
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(
            xmlText,
            "application/xml"
        );

        if (xmlDoc.querySelector("parsererror")) {
            throw new Error("Invalid XML format");
        }

        // 4. Find every student record.
        const studentNodes = Array.from(
            xmlDoc.getElementsByTagName("student")
        );

        // 5. Convert XML records into JavaScript objects.
        const students = studentNodes.map(function (node) {
            return {
                id: node.getElementsByTagName("id")[0].textContent.trim(),
                name: node.getElementsByTagName("name")[0].textContent.trim(),
                username: node.getElementsByTagName("username")[0].textContent.trim(),
                course: node.getElementsByTagName("course")[0].textContent.trim(),
                semester: Number(
                    node.getElementsByTagName("semester")[0].textContent
                ),
                marks: Number(
                    node.getElementsByTagName("marks")[0].textContent
                )
            };
        });

        // 6. Find the currently logged-in student.
        const currentStudent = students.find(function (student) {
            return student.id === loggedInId;
        });

        if (!currentStudent) {
            sessionStorage.removeItem("studentId");
            window.location.replace("index.html");
            return;
        }

        // 7. Show a welcome message.
        document.getElementById("welcomeMessage").textContent =
            "Welcome, " + currentStudent.name + "!";

        // 8. Calculate dashboard statistics.
        const total = students.length;

        const totalMarks = students.reduce(function (sum, student) {
            return sum + student.marks;
        }, 0);

        const average = totalMarks / total;

        const topStudent = students.reduce(function (best, student) {
            return student.marks > best.marks ? student : best;
        });

        document.getElementById("totalStudents").textContent = total;
        document.getElementById("averageMarks").textContent =
            average.toFixed(2) + "%";

        document.getElementById("topStudent").textContent =
            topStudent.name + " (" + topStudent.marks + "%)";

        // 9. Generate the student table.
        students.forEach(function (student) {
            const row = document.createElement("tr");

            if (student.id === topStudent.id) {
                row.classList.add("top-student");
            }

            const values = [
                student.id,
                student.name,
                student.course,
                student.semester,
                student.marks + "%"
            ];

            values.forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });

        // 10. Show a success message.
        message.textContent =
            "Loaded " + total + " student records successfully.";

        // 11. Hide or show the table.
        const toggleButton =
            document.getElementById("toggleTableButton");

        const tableContainer =
            document.getElementById("tableContainer");

        toggleButton.addEventListener("click", function () {
            tableContainer.classList.toggle("hidden");

            if (tableContainer.classList.contains("hidden")) {
                toggleButton.textContent = "Show Student Table";
            } else {
                toggleButton.textContent = "Hide Student Table";
            }
        });

        // 12. Change the heading.
        document.getElementById("changeHeadingButton")
            .addEventListener("click", function () {
                const heading =
                    document.getElementById("sectionHeading");

                heading.textContent =
                    heading.textContent === "Student Records"
                        ? "Our Student Database"
                        : "Student Records";
            });

        // 13. Toggle dark mode.
        document.getElementById("themeButton")
            .addEventListener("click", function () {
                document.body.classList.toggle("dark-mode");

                const isDark =
                    document.body.classList.contains("dark-mode");

                this.textContent = isDark
                    ? "Switch to Light Mode"
                    : "Toggle Dark Mode";
            });

    } catch (error) {
        console.error(error);
        message.textContent =
            "Unable to load student data. Check the XML file and server.";

        document.getElementById("totalStudents").textContent = "—";
        document.getElementById("averageMarks").textContent = "—";
        document.getElementById("topStudent").textContent = "—";
    }
}

// 14. Log out.
document.getElementById("logoutButton")
    .addEventListener("click", function () {
        sessionStorage.removeItem("studentId");
        window.location.replace("index.html");
    });