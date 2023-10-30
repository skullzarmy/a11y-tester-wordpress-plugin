class A11yAdminBarTester extends window.A11yBaseTester {
    constructor() {
        super("admin-bar");
        this.resultContainer = null;
        this.initResultContainer();
    }

    initResultContainer() {
        this.resultContainer = document.createElement("div");
        this.resultContainer.id = "a11y-result-container";
        this.resultContainer.className = "a11y-result-container-hidden";
        document.body.appendChild(this.resultContainer);
    }

    async loadAxeCore() {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.3.3/axe.min.js";
            script.crossOrigin = "anonymous";
            script.onload = () => {
                console.log("Axe Core loaded.");
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async runA11yTests() {
        if (typeof axe === "undefined") {
            return;
        }

        this.clearResults();

        const options = {};
        const adminBar = document.getElementById("wpadminbar");

        // Temporarily hide the admin bar if it exists
        if (adminBar) {
            adminBar.style.display = "none";
        }

        axe.run(document.body, options, (err, results) => {
            // Restore the admin bar display after the test
            if (adminBar) {
                adminBar.style.display = "";
            }

            if (err) {
                console.error("Axe run failed:", err);
                return;
            }
            this.showResults(results);
        });
    }

    clearResults() {
        this.resultContainer.innerHTML = "";
        this.resultContainer.className = "a11y-result-container-hidden";
    }

    showResults(results) {
        const closeButton = document.createElement("button");
        closeButton.className = "a11y-result-close-button";
        closeButton.textContent = "Close";
        closeButton.addEventListener("click", () => this.clearResults());

        const resultText = document.createElement("div");
        resultText.className = "a11y-result-text";
        resultText.textContent = JSON.stringify(results, null, 2);

        this.resultContainer.appendChild(closeButton);
        this.resultContainer.appendChild(resultText);
        this.resultContainer.className = "a11y-result-container-visible";
    }
}

async function a11yAdminBarClick() {
    console.log("Running accessibility tests...");
    const tester = new A11yAdminBarTester();
    try {
        await tester.loadAxeCore();
        await tester.runA11yTests();
    } catch (error) {
        console.error("Error encountered:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const a11yButton = document.querySelector(".a11y-admin-bar-button a");

    if (a11yButton) {
        a11yButton.addEventListener("click", function (event) {
            event.preventDefault();
            a11yAdminBarClick();
        });
    }
});
