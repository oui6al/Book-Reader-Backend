class Constants{
    static readonly MONGO_DBNAME: string = "BookReader";
    static readonly MONGO_BOOK_COLLECTION: string = "Book";
    static readonly MONGO_INDEX_COLLECTION: string = "Index";
    static readonly MONGO_REVERSE_INDEX_COLLECTION: string = "ReverseIndex";
    static readonly GUTENDEX_URL: string = 'http://gutendex.com/books/?languages=en';
    static readonly FORMAT_TXT: string = "text/plain; charset=us-ascii";
    static readonly FORMAT_HTML: string = "text/html";
    static readonly CONFIG_FILENAME : string = "Config.json";
}

export default Constants;