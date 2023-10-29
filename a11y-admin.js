class A11yAdminTester extends window.A11yBaseTester {
    constructor() {
        super(document.querySelector("input#post_ID").value);
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

    toggleButtons(disabled) {
        const runBtn = document.querySelector("#run-a11y-test-button");
        const clrBtn = document.querySelector("#clear-a11y-test-button");
        if (runBtn) runBtn.disabled = disabled;
        if (clrBtn) clrBtn.disabled = disabled;
    }

    initSpinner() {
        this.spinner = document.createElement("span");
        this.spinner.className = "spinner is-active";
        const runBtn = document.querySelector("#run-a11y-test-button");
        if (runBtn) runBtn.insertAdjacentElement("afterend", this.spinner);
    }

    async runAxeTest(docContent) {
        const iframe = this.createIframe(docContent);
        await this.injectAxeScript(iframe);

        return new Promise((resolve, reject) => {
            if (iframe.contentWindow.document.readyState === "loading") {
                iframe.contentWindow.addEventListener("DOMContentLoaded", () => {
                    this.executeAxe(iframe, resolve, reject);
                });
            } else {
                // Document already loaded
                this.executeAxe(iframe, resolve, reject);
            }
        }).catch((err) => {
            this.handleError(err);
        });
    }
}

new A11yAdminTester();
