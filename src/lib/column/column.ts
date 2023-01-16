export class Column {
    constructor(name: string) {
        this.Name = name;
    }

    public Name: string;
    public Children?: Column[] = [];
}