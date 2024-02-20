class Book {
  constructor(json) {
    this.id = json.id;
    this.title = json.title;
    this.subjects = json.subjects;
    this.authors = json.authors;
    this.translators = json.translators;
    this.bookshelves = json.bookshelves;
    this.languages = json.languages;
    this.copyright = json.copyright;
    this.media_type = json.media_type;
    this.formats = json.formats;
    this.download_count = json.download_count;
  }
}

export default Book;