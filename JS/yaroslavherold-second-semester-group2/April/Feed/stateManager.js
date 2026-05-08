class StateManager {
    constructor() {
        this.currentPage = 1;
        this.limit = 12;
        this.hasMore = true;
        this.isLoading = false;
        this.searchQuery = '';
        this.posts = [];
    }

    loadFirstPage() {
        this.currentPage = 1;
        this.posts = [];
        this.hasMore = true;
    }

    loadNextPage() {
        this.currentPage++;
    }

    startLoading() {
        this.isLoading = true;
    }

    finishLoading() {
        this.isLoading = false;
    }

    setHasMore(value) {
        this.hasMore = value;
    }

    updateSearch(search) {
        this.searchQuery = search;
        this.loadFirstPage();
    }
}