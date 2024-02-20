import { createServer } from 'http';
import axios from 'axios';
import Book from './Book';
import ForwardIndexDocument from './ForwardIndexDocument';
import ForwardIndexTable from './ForwardIndexTable';
const server = createServer(async (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello!');
});
const tokenizedTable = new ForwardIndexTable();
for (let id = 1; id <= 1664; id++) {
    try {
        const response = await axios.get(`http://gutendex.com/books/${id}`);
        if (response.status == 200) {
            const book = new Book(response.data);
            console.log("Book fetched successfully: ", book.title);
            const book_url = book.formats['text/plain; charset=us-ascii'];
            console.log("fetching ", book.title, " content...");
            const retrieved = await axios.get(book_url);
            if (retrieved.status == 200) {
                let book_content = JSON.stringify(retrieved.data);
                console.log("Content for ", book.title, " fetched successfully");
                const forwardIndexDocument = new ForwardIndexDocument(book_content);
                tokenizedTable.addBooktoForwardTable(book.id, forwardIndexDocument.keywords);
                console.log(tokenizedTable);
            }
        }
    }
    catch (error) {
        console.error(`Error indexing book with id ${id}:`, error);
    }
}
server.listen(9000, 'localhost', () => {
    console.log('Server is running on port 9000');
});
