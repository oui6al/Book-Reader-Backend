class Book {
    title: any;
    subjects: any;
    authors: any;
    id: any;
    translators: any;
    bookshelves: any;
    copyright: any;
    media_type: any;
    formats: any;
    download_count: any;
    words_count: any;
    constructor(json: Book) {
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
      this.words_count = 0
    }
  }
  
  export default Book;