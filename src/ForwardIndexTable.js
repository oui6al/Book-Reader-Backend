class ForwardIndexTable {
    table = [[]];
    addBooktoForwardTable(book_id, keywords) {
        this.table[book_id] = [];
        for (let [keyword, count] of keywords.entries()) {
            this.table[book_id][keyword] = count;
        }
    }
}
export default ForwardIndexTable;
