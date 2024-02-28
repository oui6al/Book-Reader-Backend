class Constants{
    static readonly MONGO_DBNAME: string = "BookReader";
    static readonly MONGO_BOOK_COLLECTION: string = "Book";
    static readonly MONGO_INDEX_COLLECTION: string = "Index";
    static readonly MONGO_REVERSE_INDEX_COLLECTION: string = "ReverseIndex";
    static readonly FORMAT_TXT: string = "text/plain; charset=us-ascii";
    static readonly FORMAT_HTML: string = "text/html";
    static readonly CONFIG_FILENAME : string = "Config.json";
    static readonly NEO4J_URL : string = "neo4j+s://959e849a.databases.neo4j.io";
    static readonly NEO4J_USER : string = "neo4j";
    static readonly NEO4J_PASSWORD : string = "4nZUbu7sfIobz9eBcKv5MjJaPKB_nGixKYpI152dNnI";
    static readonly GRAPH_SIMILARITY : number = 0.75;

}

export default Constants;