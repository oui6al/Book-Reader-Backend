class GraphBook {
    id;
    title;
    subjects;
    author;
    constructor(id, title, subjects, authors) {
        this.id = id;
        this.title = title;
        this.subjects = subjects;
        this.author = authors.length > 0 ? authors[0].name : "";
    }
}
export default GraphBook;
