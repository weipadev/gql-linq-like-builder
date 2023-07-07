import { SortEnum } from "../enums";
import { Query } from "../query";
import { ComplexSortField, Sort, SortField } from "./sort";

export class SortBuilder<T = any> {

    private parent!: Query;
    private sort!: Sort;

    constructor(query: Query) {
        this.sort = new Sort();

        this.parent = query;
        this.parent.SortByBuilder = this.sort;
    }

    /**
     * Creates a new complex field
     * @remarks Case the entity was previous sorted, old will be replaced
     * @param name - The name of column in database
     * @returns A new ComplexFieldBuilder instance
     *
    */
    public AddEntity<S = any>(name: keyof T) {
        let existentFieldIndex = this.sort.Fields.findIndex(sortField => sortField.Name === name);
        
        if (existentFieldIndex != -1) {
            this.sort.Fields.splice(existentFieldIndex, 1)
        }

        return new ComplexSortBuilder<S>(this.sort, name as string);
    }

    /**
     * Creates a new sort field
     * @remarks Case the field was previous sorted, old will be replaced
     * @param field - The field to sort by
     * @param sort - The sorting type 
     * @returns This instance of SortBuilder
     *
    */
    public AddOrder(field: keyof T, sort: SortEnum) {
        let existentFieldIndex = this.sort.Fields.findIndex(sortField => sortField.Name === field);
        
        if (existentFieldIndex != -1) {
            this.sort.Fields.splice(existentFieldIndex, 1)
        }

        this.sort.Fields.push(new SortField(field as string, sort));

        return this;
    }

}

export class ComplexSortBuilder<T = any> {

    private parent: Sort | ComplexSortField;
    private complexField: ComplexSortField;

    constructor(parent: Sort | ComplexSortField, name: string) {
        this.parent = parent;
        this.complexField = new ComplexSortField(name);

        if (this.parent instanceof ComplexSortField) {
            this.parent.ComplexChildren.push(this.complexField);
        } else if (this.parent instanceof Sort) {
            this.parent.Fields.push(this.complexField);
        }
    }

    /**
     * Creates a new complex field
     * @remarks Case the entity was previous sorted, old will be replaced
     * @param name - The name of column in database
     * @returns A new ComplexFieldBuilder instance
     *
    */
    public AddEntity<S = any>(name: keyof T) {
        let existentFieldIndex = this.complexField.ComplexChildren.findIndex(sortField => sortField.Name === name);
        
        if (existentFieldIndex != -1) {
            this.complexField.ComplexChildren.splice(existentFieldIndex, 1)
        }

        return new ComplexSortBuilder<S>(this.complexField, name as string);
    }

    /**
     * Creates a new sort field
     * @remarks Case the field was previous sorted, old will be replaced
     * @param field - The field to sort by
     * @param sort - The sorting type 
     * @returns This instance of SortBuilder
     *
    */
    public AddOrder(field: keyof T, sort: SortEnum) {
        let existentFieldIndex = this.complexField.Fields.findIndex(sortField => sortField.Name === field);
        
        if (existentFieldIndex != -1) {
            this.complexField.Fields.splice(existentFieldIndex, 1)
        }

        this.complexField.Fields.push(new SortField(field as string, sort));
        return this;
    }

}