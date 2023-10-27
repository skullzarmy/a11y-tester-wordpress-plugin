class A11yTester {
    constructor() {
        this.postID = document.querySelector("input#post_ID").value;
        this.metaBoxInsideDiv = document.querySelector("#a11y_meta_box .inside");
        this.spinner = null;
        this.addEventListeners();
    }

    addEventListeners() {
        window.addEventListener("DOMContentLoaded", () => this.initButtons());
        window.addEventListener("click", (e) => this.handleCollapsibleClick(e));
    }

    initButtons() {
        if (!this.metaBoxInsideDiv) return;

        const runBtn = this.createButton("Run A11y Test", "run-a11y-test-button", () => this.runA11yTests());
        const clrBtn = this.createButton("Clear A11y Test", "clear-a11y-test-button", () => this.clearResults());

        this.metaBoxInsideDiv.append(runBtn, clrBtn, this.createHelpText());
    }

    createButton(text, id, clickHandler) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.id = id;
        btn.textContent = text;
        btn.addEventListener("click", clickHandler);
        return btn;
    }

    createHelpText() {
        const helpText = document.createElement("p");
        helpText.textContent = "Make sure you have saved the post before running the test.";
        return helpText;
    }

    handleCollapsibleClick(e) {
        if (!e.target.classList.contains("collapsible")) return;

        const content = e.target.nextElementSibling;
        const caret = e.target.querySelector(".dashicons");
        content.style.display = content.style.display === "block" ? "none" : "block";
        caret.className = `dashicons dashicons-arrow-${content.style.display === "block" ? "up" : "down"}`;
    }

    async runA11yTests() {
        this.initSpinner();
        try {
            const data = await this.fetchPostData();
            const docContent = await this.fetchPageContent(data.data.url);
            await this.runAxeTest(docContent);
        } catch (err) {
            this.handleError(err);
        } finally {
            this.removeSpinner();
        }
    }

    initSpinner() {
        this.spinner = document.createElement("span");
        this.spinner.className = "spinner is-active";
        const runBtn = document.querySelector("#run-a11y-test-button");
        if (runBtn) runBtn.insertAdjacentElement("afterend", this.spinner);
    }

    async fetchPostData() {
        const requestData = {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `action=run_a11y_test&post_id=${this.postID}&security=${wpData.nonce}`,
        };
        const response = await fetch(wpData.ajax_url, requestData);
        if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
        return await response.json();
    }

    async fetchPageContent(url) {
        const response = await fetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        return parser.parseFromString(text, "text/html");
    }

    async runAxeTest(docContent) {
        const iframe = this.createIframe(docContent);
        await this.injectAxeScript(iframe);

        iframe.contentWindow.axe.run((err, results) => {
            if (err) throw err;
            this.handleTestResults(results);
            document.body.removeChild(iframe);
        });
    }

    createIframe(docContent) {
        const iframe = document.createElement("iframe");
        iframe.id = "a11yTestIframe";
        iframe.style.cssText = "position:absolute; opacity:0; width:1px; height:1px; border:none;";
        document.body.appendChild(iframe);
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(docContent.documentElement.outerHTML);
        iframe.contentWindow.document.close();
        return iframe;
    }

    async injectAxeScript(iframe) {
        return new Promise((resolve, reject) => {
            const script = iframe.contentWindow.document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.3.3/axe.min.js";
            script.onload = resolve;
            script.onerror = reject;
            iframe.contentWindow.document.head.appendChild(script);
        });
    }

    handleTestResults(results) {
        if (!this.metaBoxInsideDiv) return;
        const container = document.createElement("div");
        container.id = "a11y-results";

        const summarySection = this.createSummarySection(results);
        container.appendChild(summarySection);

        const resHeader = document.createElement("h3");
        resHeader.textContent = "Violation Details";
        container.appendChild(resHeader);

        const resSubHeader = document.createElement("p");
        resSubHeader.textContent = "Click on a violation to see more details.";
        container.appendChild(resSubHeader);

        this.appendViolationSections(container, results.violations);

        if (this.metaBoxInsideDiv) this.metaBoxInsideDiv.appendChild(container);
    }

    handleError(err) {
        console.error("Error running accessibility tests:", err);

        // Remove any existing error messages
        const existingError = this.metaBoxInsideDiv.querySelector(".error");
        if (existingError) existingError.remove();

        const errorMsg = document.createElement("div");
        errorMsg.className = "error";
        errorMsg.textContent = `Error: ${err.message}`;
        if (this.metaBoxInsideDiv) this.metaBoxInsideDiv.appendChild(errorMsg);
    }

    removeSpinner() {
        if (this.spinner) this.spinner.remove();
    }

    clearResults() {
        // Remove a11y results if they exist
        const oldResults = document.getElementById("a11y-results");
        if (oldResults) oldResults.remove();

        // Remove any lingering error messages
        const errorMsg = this.metaBoxInsideDiv.querySelector(".error");
        if (errorMsg) errorMsg.remove();

        // Remove any lingering iframes
        const oldIframe = document.getElementById("a11yTestIframe");
        if (oldIframe) oldIframe.remove();
    }

    createSummarySection(results) {
        const summarySection = document.createElement("div");
        summarySection.id = "a11y-summary-container";

        summarySection.append(this.generateTestSummary(results), this.generateViolationsTable(results));

        return summarySection;
    }

    generateTestSummary(results) {
        const summaryDiv = document.createElement("div");
        summaryDiv.id = "a11y-test-summary";

        const categories = [
            ["Inapplicable", results.inapplicable.length],
            ["Incomplete", results.incomplete.length],
            ["Passes", results.passes.length],
            ["Violations", results.violations.length],
        ];

        const summaryList = this.createList(categories, (item) => {
            const [label, count] = item;
            const listItem = document.createElement("li");
            listItem.className = `summary-${label.toLowerCase()}`;
            listItem.textContent = `${label}: ${count}`;
            return listItem;
        });

        summaryDiv.append(this.createHeader("Test Summary"), summaryList);

        return summaryDiv;
    }

    generateViolationsTable(results) {
        const violationsDiv = document.createElement("div");
        violationsDiv.id = "a11y-violations-table";

        const severityCounts = results.violations.reduce(
            (acc, violation) => {
                if (violation.impact) acc[violation.impact]++;
                return acc;
            },
            { critical: 0, serious: 0, moderate: 0, minor: 0 }
        );

        const totalViolations = Object.values(severityCounts).reduce((a, b) => a + b, 0);

        if (totalViolations === 0) {
            const zeroCount = document.createElement("p");
            zeroCount.style.color = "green";
            zeroCount.textContent = "0";
            violationsDiv.appendChild(zeroCount);
            return violationsDiv;
        }

        const tableBody = this.createList(Object.entries(severityCounts), ([severity, count]) => {
            if (count === 0) return null;

            const row = document.createElement("tr");
            const tdSeverity = document.createElement("td");
            const tdCount = document.createElement("td");
            tdSeverity.className = `impact-${severity}`;
            tdCount.className = `impact-${severity}`;
            tdSeverity.textContent = severity;
            tdCount.textContent = count;
            row.append(tdSeverity, tdCount);

            return row;
        });

        const table = document.createElement("table");
        table.append(tableBody);

        violationsDiv.append(this.createHeader("Violations Summary"), table);

        return violationsDiv;
    }

    createList(items, callback) {
        const list = document.createElement("ul");
        for (const item of items) {
            const listItem = callback(item);
            if (listItem) list.appendChild(listItem);
        }
        return list;
    }

    createHeader(text) {
        const header = document.createElement("h3");
        header.textContent = text;
        return header;
    }

    appendViolationSections(container, violations) {
        const sortedViolations = this.sortViolationsBySeverity(violations);
        sortedViolations.forEach((violation) => {
            const section = this.createViolationSection(violation);
            container.appendChild(section);
        });
    }

    sortViolationsBySeverity(violations) {
        const severityOrder = ["critical", "serious", "moderate", "minor"];
        return violations.sort((a, b) => {
            return severityOrder.indexOf(a.impact) - severityOrder.indexOf(b.impact);
        });
    }

    createViolationSection(violation) {
        const section = document.createElement("div");
        const button = this.createCollapsibleButton(violation);
        const content = document.createElement("div");
        content.className = "a11y-content";

        const table = this.createTable([
            ["Description", violation.description],
            ["Help", violation.help],
            ["Help URL", `<a href="${violation.helpUrl}" target="_blank">${violation.helpUrl}</a>`],
        ]);

        const nodeSection = this.createNodeSection(violation);

        content.append(table, nodeSection);
        section.append(button, content);

        return section;
    }

    createCollapsibleButton(violation) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `collapsible impact-${violation.impact}`;
        button.innerHTML = `${violation.id} - ${violation.impact}`;

        const caretSpan = document.createElement("span");
        caretSpan.className = "dashicons dashicons-arrow-down";
        button.appendChild(caretSpan);

        return button;
    }

    createTable(rows) {
        const table = document.createElement("table");
        rows.forEach(([header, value]) => {
            const row = document.createElement("tr");
            const th = document.createElement("th");
            const td = document.createElement("td");

            th.textContent = header;
            td.innerHTML = value;

            row.append(th, td);
            table.appendChild(row);
        });
        return table;
    }

    createNodeSection(violation) {
        const nodeSection = document.createElement("div");
        nodeSection.textContent = "Affected Nodes:";
        violation.nodes.forEach((node) => {
            const table = this.createTable([
                ["HTML Element", `<code>${this.escapeHTML(node.html)}</code>`],
                ["Impact", node.impact],
                ["Failure Summary", node.failureSummary],
            ]);
            nodeSection.appendChild(table);
        });
        return nodeSection;
    }

    escapeHTML(unsafeText) {
        const text = document.createTextNode(unsafeText);
        const p = document.createElement("p");
        p.appendChild(text);
        return p.innerHTML;
    }
}

new A11yTester();
