import express from 'express';
import cors from 'cors';
import  SearchService  from './SearchService.js';
import axios from 'axios';
import GraphSearchService from './GraphSearchService.js';


const app = express();
app.use(express.json());
app.use(cors());
const searchService = new SearchService();
const graphSearchService = new GraphSearchService();
await graphSearchService.CreateGraph();

// POST route pour la recherche simple
app.post('/api/search', async (req, res) => {
    try {
        const input = req.body.query;
        const sort = req.body.sort;
        const books =  await searchService.getSearchResult(input,"simple"); 
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// POST route pour la recherche avncée
app.post('/api/advanced-search', async (req, res) => {
    try {
        const input = req.body.query;
        const sort = req.body.sort;
        const books = await searchService.getSearchResult(input,"advanced")
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
});

// POST route pour le tri des livres
app.post('/api/sort', async (req, res) => {
    try {
        const books = req.body.books;
        const sort = req.body.option;
        const sortedBooks = await searchService.resortBooks(books,sort);
        res.json(sortedBooks);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
});

// GET route pour récupérer le HTML d'un livre avec son id 
app.get('/api/book/:id', async (req, res) => {
    try {
        const id  = parseInt(req.params.id);
        const book = await searchService.fetchBook(id);
        console.log(book);
        res.json(book);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.post('/api/getContent/', async (req, res) => {
    try {
        const url = req.body.url;
        const content = await axios.get(url);
        res.send(content.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }

});

// POST route pour récupérer les suggestions à partir de l'historique des livres.
app.post('/api/getSuggestions/', async (req, res) => {
    try {
        const booksIds = req.body.bookIds;
        console.log("BooksIds = ", booksIds);
        const books = await graphSearchService.GetSuggestion(booksIds);
        console.log("Books = ", books);
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }

});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

