"use strict";
const InvertIndexing = (forwardIndexedTable) => {
    const InvertedIndexTable = {};
    for (const bookId in forwardIndexedTable) {
        const words = forwardIndexedTable[bookId];
        for (const word of words) {
            if (!InvertedIndexTable[word]) {
                InvertedIndexTable[word] = {};
            }
            InvertedIndexTable[word][bookId] = forwardIndexedTable[bookId][word];
        }
    }
    return InvertedIndexTable;
};
