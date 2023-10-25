function escapeHTML(str) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function createSummarySection(results) {
    // Create the main flex container
    const flexContainer = document.createElement("div");
    flexContainer.id = "a11y-summary-container";

    // Create the summary div
    const summaryDiv = document.createElement("div");
    summaryDiv.id = "a11y-summary";
    const summaryHeader = document.createElement("h3");
    summaryHeader.textContent = "Test Summary";
    summaryDiv.appendChild(summaryHeader);

    const summaryList = document.createElement("ul");

    // Create an object to hold the counts for each severity
    const severityCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };

    // Count each violation by severity
    results.violations.forEach((violation) => {
        if (violation.impact) {
            severityCounts[violation.impact]++;
        }
    });

    // Generate the summary list
    [
        ["Inapplicable", results.inapplicable.length],
        ["Incomplete", results.incomplete.length],
        ["Passes", results.passes.length],
        ["Violations", results.violations.length],
    ].forEach(([label, count]) => {
        const listItem = document.createElement("li");
        listItem.className = `summary-${label.toLowerCase()}`;
        listItem.textContent = `${label}: ${count}`;

        summaryList.appendChild(listItem);
    });

    summaryDiv.appendChild(summaryList);

    // Create the violations table
    const violationsTable = document.createElement("table");
    violationsTable.id = "violations-table";
    // const tableHeader = document.createElement("thead");
    // const tableHeaderRow = document.createElement("tr");

    // Create the table header
    // ["Severity", "Count"].forEach((headerText) => {
    //     const th = document.createElement("th");
    //     th.textContent = headerText;
    //     tableHeaderRow.appendChild(th);
    // });

    // tableHeader.appendChild(tableHeaderRow);
    // violationsTable.appendChild(tableHeader);

    // Create the table body with severity counts
    const tableBody = document.createElement("tbody");
    Object.entries(severityCounts).forEach(([severity, count]) => {
        const tr = document.createElement("tr");
        const tdSeverity = document.createElement("td");
        const tdCount = document.createElement("td");
        tdSeverity.className = `impact-${severity}`;
        tdCount.className = `impact-${severity}`;
        tdSeverity.textContent = severity;
        tdCount.textContent = count;
        tr.appendChild(tdSeverity);
        tr.appendChild(tdCount);
        tableBody.appendChild(tr);
    });

    violationsTable.appendChild(tableBody);

    const violationsDiv = document.createElement("div");
    violationsDiv.id = "a11y-violations-table-wrapper";
    const violationsHeader = document.createElement("h3");
    violationsHeader.textContent = "Violations Summary";
    violationsDiv.appendChild(violationsHeader);
    violationsDiv.appendChild(violationsTable);

    // Append the summary and table to the main flex container
    flexContainer.appendChild(summaryDiv);
    flexContainer.appendChild(violationsDiv);

    return flexContainer;
}

function appendViolationSections(container, violations) {
    // sort violations by severity
    violations.sort((a, b) => {
        if (a.impact === "critical" && b.impact !== "critical") {
            return -1;
        }
        if (a.impact !== "critical" && b.impact === "critical") {
            return 1;
        }
        if (a.impact === "serious" && b.impact === "moderate") {
            return -1;
        }
        if (a.impact === "moderate" && b.impact === "serious") {
            return 1;
        }
        if (a.impact === "serious" && b.impact === "minor") {
            return -1;
        }
        if (a.impact === "minor" && b.impact === "serious") {
            return 1;
        }
        if (a.impact === "moderate" && b.impact === "minor") {
            return -1;
        }
        if (a.impact === "minor" && b.impact === "moderate") {
            return 1;
        }
        return 0;
    });
    violations.forEach((violation) => {
        const section = document.createElement("div");
        const button = document.createElement("button");
        button.type = "button";
        const content = document.createElement("div");

        button.innerHTML = `${violation.id} - ${violation.impact}`;
        button.className = `collapsible impact-${violation.impact}`;
        content.className = "a11y-content";

        const caretSpan = document.createElement("span");
        caretSpan.className = "dashicons dashicons-arrow-down";
        caretSpan.setAttribute("aria-hidden", "true");

        button.innerHTML = `${violation.id} - ${violation.impact} `;
        button.className = `collapsible impact-${violation.impact}`;

        button.appendChild(caretSpan);
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
                <tr><th>HTML Element</th><td><code>${escapeHTML(node.html)}</code></td></tr>
                <tr><th>Impact</th><td class="impact-${violation.impact}">${node.impact}</td></tr>
                <tr><th>Failure Summary</th><td>${node.failureSummary}</td></tr>
            `;

            nodeSection.appendChild(nodeTable);
        });

        content.appendChild(table);
        content.appendChild(nodeSection);
        container.appendChild(section);
    });
}

async function fetchPageContent(url) {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    return doc;
}

function injectAxeScript(iframe) {
    return new Promise((resolve, reject) => {
        const script = iframe.contentWindow.document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.3.3/axe.min.js";
        script.onload = resolve;
        script.onerror = reject;
        iframe.contentWindow.document.head.appendChild(script);
    });
}

async function runA11yTests(event) {
    event.preventDefault();

    const postID = document.querySelector("input#post_ID").value;
    const requestData = {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `action=run_a11y_test&post_id=${postID}&security=${wpData.nonce}`,
    };

    const spinner = document.createElement("span");
    spinner.className = "spinner is-active";
    const metaBoxInsideDiv = document.querySelector("#a11y_meta_box .inside");
    if (metaBoxInsideDiv) {
        metaBoxInsideDiv.appendChild(spinner);
    }

    try {
        const response = await fetch(wpData.ajax_url, requestData);
        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();
        const docContent = await fetchPageContent(data.data.url);

        const iframe = document.createElement("iframe");
        iframe.id = "a11yTestIframe";
        iframe.style.position = "absolute";
        iframe.style.opacity = "0";
        iframe.style.width = "1px";
        iframe.style.height = "1px";
        iframe.style.border = "none";
        document.body.appendChild(iframe);

        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(docContent.documentElement.outerHTML);
        iframe.contentWindow.document.close();

        await new Promise((resolve, reject) => {
            const script = iframe.contentWindow.document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.3.3/axe.min.js";
            script.onload = resolve;
            script.onerror = reject;
            iframe.contentWindow.document.head.appendChild(script);
        });

        iframe.onload = () => {
            iframe.contentWindow.axe.run((err, results) => {
                if (err) throw err;

                if (spinner) spinner.remove();

                const oldResults = document.getElementById("a11y-results");
                if (oldResults) oldResults.remove();

                const container = document.createElement("div");
                container.id = "a11y-results";

                const summarySection = createSummarySection(results);
                container.appendChild(summarySection);

                const resHeader = document.createElement("h3");
                resHeader.textContent = "Violation Details";
                container.appendChild(resHeader);
                const resSubHeader = document.createElement("p");
                resSubHeader.textContent = "Click on a violation to see more details.";
                container.appendChild(resSubHeader);

                appendViolationSections(container, results.violations);

                if (metaBoxInsideDiv) {
                    metaBoxInsideDiv.appendChild(container);
                }

                document.body.removeChild(iframe);
            });
        };
    } catch (err) {
        console.error("Error running accessibility tests:", err);
        const errorMsg = document.createElement("div");
        errorMsg.className = "error";
        errorMsg.textContent = `Error: ${err.message}`;
        if (metaBoxInsideDiv) {
            metaBoxInsideDiv.appendChild(errorMsg);
        }
        if (spinner) spinner.remove();
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const metaBoxInsideDiv = document.querySelector("#a11y_meta_box .inside");
    if (metaBoxInsideDiv) {
        const existingButton = metaBoxInsideDiv.querySelector("#run-a11y-test-button");
        if (existingButton) {
            existingButton.remove();
        }

        const btn = document.createElement("button");
        btn.type = "button";
        btn.id = "run-a11y-test-button";
        btn.textContent = "Run A11y Test";
        btn.addEventListener("click", runA11yTests);
        metaBoxInsideDiv.appendChild(btn);

        const clrBtn = document.createElement("button");
        clrBtn.type = "button";
        clrBtn.id = "clear-a11y-test-button";
        clrBtn.textContent = "Clear A11y Test";
        clrBtn.addEventListener("click", () => {
            const oldResults = document.getElementById("a11y-results");
            if (oldResults) oldResults.remove();
        });
        metaBoxInsideDiv.appendChild(clrBtn);

        const helpText = document.createElement("p");
        helpText.textContent = "Make sure you have saved the post before running the test.";
        metaBoxInsideDiv.appendChild(helpText);
    }
});

window.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("collapsible")) {
        const content = e.target.nextElementSibling;
        const caret = e.target.querySelector(".dashicons");

        if (content.style.display === "block") {
            content.style.display = "none";
            if (caret) caret.className = "dashicons dashicons-arrow-down";
        } else {
            content.style.display = "block";
            if (caret) caret.className = "dashicons dashicons-arrow-up";
        }
    }
});
