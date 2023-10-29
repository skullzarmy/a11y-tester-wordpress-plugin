class A11yBaseTester {
    constructor(postID) {
        this.postID = postID;
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

    async runA11yTests() {
        try {
            const data = await this.fetchPostData();
            const docContent = await this.fetchPageContent(data.data.url);
            await this.runAxeTest(docContent);
        } catch (err) {
            this.handleError(err);
        }
    }

    async runAxeTest(docContent) {
        throw new Error("Method runAxeTest() must be implemented by subclass.");
    }

    handleError(err) {
        console.error("Error running accessibility tests:", err);
    }
}

export default A11yBaseTester;
