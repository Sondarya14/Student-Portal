// Find the login form in the HTML.
const loginForm = document.getElementById("loginForm");

// Find the place where messages will appear.
const message = document.getElementById("message");

// Listen for the form being submitted.
loginForm.addEventListener("submit", async function (event) {
    // Stop the browser from refreshing the page.
    event.preventDefault();

    // Read what the student typed.
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "Checking your details...";

    try {
        // Request the XML file.
        const response = await fetch("students.xml");

        // Check whether the request succeeded.
        if (!response.ok) {
            throw new Error("Could not load the student XML file.");
        }

        // Read the XML file as text.
        const xmlText = await response.text();

        // Convert the text into an XML document.
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(
            xmlText,
            "application/xml"
        );

        // Detect invalid XML.
        if (xmlDoc.querySelector("parsererror")) {
            throw new Error("The XML file contains an error.");
        }

        // Get all student records from the XML.
        const students = Array.from(
            xmlDoc.getElementsByTagName("student")
        );

        // Find a record matching both entered details.
        const student = students.find(function (item) {
            const xmlUsername =
                item.getElementsByTagName("username")[0].textContent.trim();

            const xmlPassword =
                item.getElementsByTagName("password")[0].textContent;

            return (
                xmlUsername === username &&
                xmlPassword === password
            );
        });

        if (student) {
            // Save only the student's ID for this demo.
            const studentId =
                student.getElementsByTagName("id")[0].textContent;

            sessionStorage.setItem("studentId", studentId);

            message.style.color = "green";
            message.textContent = "Login successful! Opening portal...";

            // Move to the dashboard.
            window.location.href = "portal.html";
        } else {
            message.style.color = "#b91c1c";
            message.textContent =
                "Incorrect username or password. Please try again.";
        }
    } catch (error) {
        console.error(error);
        message.style.color = "#b91c1c";
        message.textContent =
            "Unable to load student data. Check your files and server.";
    }
});