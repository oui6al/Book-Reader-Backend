class ForwardIndexTable {
  table: number[][] = [[]];

  addBooktoForwardTable(book_id: number, keywords: Map<string, number>) {
    this.table[book_id] = [];
    for (let [keyword, count] of keywords.entries()) {
      this.table[book_id][keyword as any] = count;
    }
  }
}

export default ForwardIndexTable;



