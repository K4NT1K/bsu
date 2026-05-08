class Api {
    async fetchPosts(page, limit, search) {
        const url = new URL("https://jsonplaceholder.typicode.com/posts");

        if (page) url.searchParams.append("_page", page);
        if (limit) url.searchParams.append("_limit", limit);
        if (search) url.searchParams.append("q", search);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return await response.json();
    }
}