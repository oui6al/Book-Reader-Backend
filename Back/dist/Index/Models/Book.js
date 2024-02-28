class Book {
    title;
    subjects;
    authors;
    id;
    translators;
    bookshelves;
    copyright;
    media_type;
    formats;
    download_count;
    words_count;
    constructor(json) {
        this.id = json.id;
        this.title = json.title;
        this.subjects = json.subjects;
        this.authors = json.authors;
        this.translators = json.translators;
        this.bookshelves = json.bookshelves;
        this.copyright = json.copyright;
        this.media_type = json.media_type;
        this.formats = json.formats;
        this.download_count = json.download_count;
        this.words_count = 0;
    }
}
export default Book;
