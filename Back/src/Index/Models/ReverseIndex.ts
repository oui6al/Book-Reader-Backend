class ReverseIndex {
    token: string;
    books: Record<number, number>;

    constructor(token: string, books: Record<number, number>) {
        this.token = token;
        this.books = books;
    }
}

export default ReverseIndex;
