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
            script.integrity =
                "sha512-pXOeI9K9m4t8/1wsgG8Dt8sI9FubMbNWDUU3UePGONSMYTctBNSC/w6wk6qP+k/oTF3/J9J6nXz0v2dCGjelg==";
            script.crossOrigin = "anonymous";
            script.onload = resolve;
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
        let elementToTest = document.body;
        const adminBar = document.getElementById("wpadminbar");

        if (adminBar) {
            elementToTest = document.body.cloneNode(true);
            const clonedAdminBar = elementToTest.querySelector("#wpadminbar");
            if (clonedAdminBar) {
                clonedAdminBar.remove();
            }
        }

        axe.run(elementToTest, options, (err, results) => {
            if (err) {
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

// Entry function that will be called when the admin button is clicked
function a11yAdminBarClick() {
    const tester = new A11yAdminBarTester();
    tester
        .loadAxeCore()
        .then(() => tester.runA11yTests())
        .catch((error) => console.error("Could not load Axe Core:", error));
}
