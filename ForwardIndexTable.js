
class ForwardIndexTable {
  table = [[]]

  addBooktoForwardTable(book_id, keywords) {
    // Add the book id to the table
    this.table[book_id] = [];
    for (let [keyword, count] of keywords.entries()) {
      this.table[book_id][keyword] = count;
    }
  }

}

export default ForwardIndexTable;


