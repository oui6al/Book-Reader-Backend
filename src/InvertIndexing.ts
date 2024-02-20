
const InvertIndexing = (forwardIndexedTable: { [key: string]: string[] }) => {
    const InvertedIndexTable: { [key: string]: { [key: string]: string } } = {};

    for (const bookId in forwardIndexedTable) {
        const words = forwardIndexedTable[bookId];

        for (const word of words) {
            if (!InvertedIndexTable[word]) {
                InvertedIndexTable[word] = {};
            }
            InvertedIndexTable[word][bookId] = forwardIndexedTable[bookId][word as any];
        }
    }

    return InvertedIndexTable;
};
