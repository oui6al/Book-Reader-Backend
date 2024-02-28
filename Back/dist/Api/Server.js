import express from 'express';
import cors from 'cors';
import SearchService from './SearchService.js';
const app = express();
app.use(express.json());
app.use(cors());
const searchService = new SearchService();
// POST route pour la recherche simple
app.post('/api/search', async (req, res) => {
    try {
        const input = req.body.query;
        const books = await searchService.SimpleSearch(input);
        console.log("api ", books);
        res.json(books);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
// POST route pour la recherche avncée
app.post('/api/advanced-search', async (req, res) => {
    try {
        const { input } = req.body;
        const books = await searchService.AdvancedSearch(input);
        res.json(books);
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
});
// GET route pour récupérer le HTML d'un livre avec son id 
app.get('/api/ReadBook/:id', async (req, res) => {
    try {
        const { id } = req.params;
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
