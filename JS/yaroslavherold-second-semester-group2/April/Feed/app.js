class App {
    constructor() {
        this.api = new Api;
        this.ui = new UI;
        this.stateManager = new StateManager;

        this.debounce = null;
        this.observer = null;

        this.init();
        this.setObserver();
    }

    async loadPosts(mode) {
        if (this.stateManager.isLoading) {
            return;
        }

        this.stateManager.startLoading();
        this.ui.startLoading();

        try {
            this.ui.hideError();
            this.ui.hideMessage();

            const posts = await this.api.fetchPosts(
                this.stateManager.currentPage,
                this.stateManager.limit,
                this.stateManager.searchQuery
            );

            if (mode === 'append') {
                if (this.stateManager.hasMore === false) {
                    return
                }
                this.ui.appendPosts(posts);
            } else {
                this.ui.renderPosts(posts);
            }

            if (posts.length < this.stateManager.limit) {
                this.stateManager.setHasMore(false);
                this.ui.disableLoadMoreBtn(true);
            } else {
                this.stateManager.setHasMore(true);
                this.ui.disableLoadMoreBtn(false);
            }

            if (posts.length === 0) {
                this.ui.showMessage('Ничего не найдено')
            }

            this.stateManager.loadNextPage();
        } catch (error) {
            this.ui.showError(error.message);

        } finally {
            this.stateManager.finishLoading();
            this.ui.finishLoading();
        }
    }

    init() {
        this.loadPosts('render');
        this.ui.loadMoreBtn.addEventListener('click', () => this.loadPosts('append'));
        this.ui.searchInput.addEventListener('input', async () => {
            this.stateManager.updateSearch(this.ui.searchInput.value.trim());
            clearTimeout(this.debounce);
            this.debounce = setTimeout(() => {
                this.loadPosts('render');
            }, 500);
        });
    }

    setObserver() {
        this.observer = new IntersectionObserver((entries) => {
            if (
                entries[0].isIntersecting &&
                !this.stateManager.isLoading &&
                this.stateManager.hasMore
            ) {
                this.loadPosts('append');
            }
        });

        this.observer.observe(this.ui.sentinel);
    }
}

new App();