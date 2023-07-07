import { SortEnum } from "../enums";

export class Sort {
    public Fields: (SortField | ComplexSortField)[] = []
}

export class SortField {
    public Name: string;
    public Order: SortEnum
    public Children?: Sort[]

    constructor(name: string, order: SortEnum) {
        this.Name = name;
        this.Order = order
    }
}

export class ComplexSortField {

    public Name: string; // parent name, ex: { parentName: { parentName: { filters } } }
    public Fields: SortField[] = [];
    public ComplexChildren: ComplexSortField[] = [];

    constructor(name: string) {
        this.Name = name
    }
}