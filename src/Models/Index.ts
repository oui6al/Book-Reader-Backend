class Index {
    id: number;
    tokens: Record<string, number>;

    constructor(id: number, tokens: Record<string, number>) {
        this.id = id;
        this.tokens = tokens;
    }
}

export default Index;
