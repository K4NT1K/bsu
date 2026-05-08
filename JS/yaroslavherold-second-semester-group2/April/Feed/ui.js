class UI {
    constructor() {
        this.loadMoreBtn = document.querySelector('#loadMoreBtn');
        this.postsList = document.querySelector('#postsList');
        this.errorMessage = document.querySelector('#errorMessage');
        this.loader = document.querySelector('#loader');
        this.searchInput = document.querySelector('#searchInput');
        this.emptyMessage = document.querySelector('#emptyMessage');
        this.sentinel = document.querySelector('#sentinel');
    }

    renderPosts(posts) {
        this.postsList.innerHTML = '';
        this.appendPosts(posts);
    }

    appendPosts(posts) {
        for (let i = 0; i < posts.length; i++) {
            const postEl = posts[i];
            const postCard = document.createElement("div");
            postCard.className = ("post");
            postCard.innerHTML = `
            <div class="post-title">${postEl.title}</div>
            <div class="post-body">${postEl.body}</div>
        `;
            this.postsList.appendChild(postCard);
        }
    }

    clearPosts() {
        this.postsList.innerHTML = '';
    }

    startLoading() {
        this.loader.classList.remove('hidden');
    }

    finishLoading() {
        this.loader.classList.add('hidden');
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
    }

    hideError() {
        this.errorMessage.textContent = '';
        this.errorMessage.classList.add('hidden');
    }

    showMessage(message) {
        this.emptyMessage.textContent = message;
        this.emptyMessage.classList.remove('hidden');
    }

    hideMessage() {
        this.emptyMessage.textContent = '';
        this.emptyMessage.classList.add('hidden');
    }

    disableLoadMoreBtn(isDisabled) {
        this.loadMoreBtn.disabled = isDisabled;
    }
}