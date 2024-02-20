InvertIndexing = function(forwardIndexedTable) {
    const InvertedIndexTable = {};

    for (const bookId in forwardIndexedTable) {
        const words = forwardIndexedTable[bookId];

        for (const word of words) {
            InvertedIndexTable[word][bookId] = forwardIndexedTable[bookId][word];    
        }
    }

    return InvertedIndexTable;
    

}