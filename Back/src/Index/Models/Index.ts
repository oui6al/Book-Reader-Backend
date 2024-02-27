class Index {
    id: number;
    tokens: {[token: string]: number} 

    constructor(id: number, tokens: {[token: string]: number} ) {
        this.id = id;
        this.tokens = tokens;
    }
}

export default Index;
