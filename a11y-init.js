window.addEventListener("DOMContentLoaded", function () {
    async function fetchPageContent(url) {
        const response = await fetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");
        return doc;
    }

    const runA11yTests = async () => {
        const postID = document.querySelector("input#post_ID").value;
        const requestData = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `action=run_ally_test&post_id=${postID}`,
        };

        const response = await fetch(wpData.ajax_url, requestData);
        const data = await response.json();
        const url = data.url;
        const doc = await fetchPageContent(url);

        axe.run(doc, (err, results) => {
            if (err) throw err;

            const oldResults = document.getElementById("a11y-results");
            if (oldResults) oldResults.remove();

            const container = document.createElement("div");
            container.id = "a11y-results";

            results.violations.forEach((violation) => {
                const section = document.createElement("div");
                const button = document.createElement("button");
                const content = document.createElement("div");

                button.innerHTML = `${violation.id} - ${violation.impact}`;
                button.className = `collapsible impact-${violation.impact}`;
                content.className = "a11y-content";

                section.appendChild(button);
                section.appendChild(content);

                const table = document.createElement("table");
                table.innerHTML = `
                    <tr><th>Description</th><td>${violation.description}</td></tr>
                    <tr><th>Help</th><td>${violation.help}</td></tr>
                    <tr><th>Help URL</th><td><a href="${violation.helpUrl}" target="_blank">${violation.helpUrl}</a></td></tr>
                `;

                const nodeSection = document.createElement("div");
                nodeSection.innerHTML = "<strong>Affected Nodes:</strong>";

                violation.nodes.forEach((node) => {
                    const nodeTable = document.createElement("table");
                    nodeTable.innerHTML = `
                        <tr><th>HTML Element</th><td>${node.html}</td></tr>
                        <tr><th>Impact</th><td>${node.impact}</td></tr>
                        <tr><th>Failure Summary</th><td>${node.failureSummary}</td></tr>
                    `;

                    nodeSection.appendChild(nodeTable);
                });

                content.appendChild(table);
                content.appendChild(nodeSection);
                container.appendChild(section);
            });

            const metaBoxInsideDiv = document.querySelector("#a11y_meta_box .inside");
            if (metaBoxInsideDiv) {
                metaBoxInsideDiv.appendChild(container);
            }
        });
    };

    const metaBoxInsideDiv = document.querySelector("#a11y_meta_box .inside");
    if (metaBoxInsideDiv) {
        const existingButton = metaBoxInsideDiv.querySelector("#run-a11y-test-button");
        if (existingButton) {
            existingButton.remove();
        }

        const btn = document.createElement("button");
        btn.id = "run-a11y-test-button";
        btn.textContent = "Run A11y Test";
        btn.addEventListener("click", runA11yTests);
        metaBoxInsideDiv.appendChild(btn);

        const clrBtn = document.createElement("button");
        clrBtn.id = "clear-a11y-test-button";
        clrBtn.textContent = "Clear A11y Test";
        clrBtn.addEventListener("click", () => {
            const oldResults = document.getElementById("a11y-results");
            if (oldResults) oldResults.remove();
        });
        metaBoxInsideDiv.appendChild(clrBtn);
    } else {
        console.log("No .inside div found");
    }
});

document.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("collapsible")) {
        const content = e.target.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    }
});
