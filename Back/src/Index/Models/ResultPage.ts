import Book from "./Book.js";

// Interface pour définir la structure d'une page de résultats
interface ResultPage {
    count: number;
    next: string | null;
    previous: string | null;
    results: Book[];
}

export default ResultPage;