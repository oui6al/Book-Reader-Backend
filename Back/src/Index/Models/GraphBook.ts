class GraphBook {
    id: number;
    title: string;
    subjects: string[];
    author: string;

    constructor(id: number, title: string, subjects: string[], authors: { name: string }[]) {
      this.id = id;
      this.title = title;
      this.subjects = subjects;
      this.author = authors.length > 0 ? authors[0].name : "";
    }
  }
  
  export default GraphBook;