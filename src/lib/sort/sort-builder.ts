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
     * @param name - The name of column in GraphQL Mapping
     * @returns A new ComplexFieldBuilder instance
     * @remarks To avoid query errors, its important pay attention if the field desired is sortable in current query
     * @description
     * * Case the entity was previous sorted, old will be override
     * * When used together with inline way, this method might override previous inline sort with `identical root`
    * @example ## How overriden by builder works :)
    * ```
       let queryBuilder = new QueryBuilder<User>("user", true);
       const sortBuilder = queryBuilder.CreateSort();

       sortBuilder 
        // this will be overriden cause this have the same root (order -> orderRequest)
        // than future .AddEntity("orderRequest") call
        .AddOrder("orderRequest.dateRequest", SortEnum.ASC)

       sortBuilder 
        .AddOrder("name", SortEnum.ASC)
        .AddEntity("orderRequest") // this will be evalueted
            .AddOrder("price", SortEnum.DESC)
      ```
    */
    public AddEntity<S = any>(name: keyof T) {
        let existentFieldIndex = this.sort.Fields.findIndex(sortField => sortField.Name === name || sortField.Name.startsWith(name as string));
        
        if (existentFieldIndex != -1) {
            this.sort.Fields.splice(existentFieldIndex, 1)
        }

        return new ComplexSortBuilder<S>(this.sort, name as string);
    }

    /**
     * Creates a new sort field
     * @param field - The field to sort by
     * @param sort - The sorting type 
     * @returns This instance of SortBuilder
     * @remarks To avoid query errors, its important pay attention if the field desired is sortable in current query
     * @description 
     * * Case the field was previous sorted, old will be replaced.
     * * When used in inline way, this override other complexSort entity with `equal root`
     * @example
     * ## How overriden by inline works :) 
     * ```
       let queryBuilder = new QueryBuilder<User>("user", true);
       const sortBuilder = queryBuilder.CreateSort();

       sortBuilder 
       .AddOrder("name", SortEnum.ASC)
        // this will be overriden cause this have the same root (orderRequest)
        // than future .AddOrder("orderRequest.x", SortEnum) inline call
        .AddEntity("orderRequest")
            .AddOrder("price", SortEnum.DESC)

        sortBuilder // this will be evalueted
            .AddOrder("orderRequest.dateRequest", SortEnum.ASC)
      ```
     * 
    */
    public AddOrder(field: keyof T, sort: SortEnum) {
        let isInline = false;
        let inlineField: any = null;
        if (field.toString().includes(".")) {
            inlineField = field.toString().split(".")[0];
            isInline = true;
        }
        
        let existentFieldIndex = this.sort.Fields.findIndex(sortField => isInline && sortField.Name === inlineField || sortField.Name == field);
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
     * @param name - The name of column in GraphQL Mapping
     * @returns A new ComplexFieldBuilder instance
     * @remarks To avoid query errors, its important pay attention if the field desired is sortable in current query
     * @description
     * * Case the entity was previous sorted, old will be override
     * * When used together with inline way, this method might override previous inline sort with `identical root`
     * @examples
    * ## How overriden by builder works :) 
    * ```
       let queryBuilder = new QueryBuilder<User>("user", true);
       const sortBuilder = queryBuilder.CreateSort();

       
       sortBuilder 
        // this will be overriden cause this have the same root (order -> orderRequest)
        // than future .AddEntity("order") call
        .AddEntity("order")
        .AddOrder("orderRequest.dateRequest", SortEnum.ASC)

       sortBuilder // this will be evalueted
        .AddOrder("name", SortEnum.ASC)
        .AddEntity("order")
        .AddEntity("orderRequest")
            .AddOrder("price", SortEnum.DESC)

      ```
     * 
    */
    public AddEntity<S = any>(name: keyof T) {
        let existentFieldIndex = this.complexField.ComplexChildren.findIndex(sortField => sortField.Name === name || sortField.Name.startsWith(name as string));
        
        if (existentFieldIndex != -1) {
            this.complexField.ComplexChildren.splice(existentFieldIndex, 1)
        }

        return new ComplexSortBuilder<S>(this.complexField, name as string);
    }

    /**
     * Creates a new sort field
     * @param field - The field to sort by
     * @param sort - The sorting type 
     * @returns This instance of SortBuilder
     * @remarks To avoid query errors, its important pay attention if the field desired is sortable in current query
     * @description
     * * Case the field was previous sorted, old will be replaced
     * * When used in inline way, this override other complexSort entity with equal root
     * @examples
    * ## How overriden by inline works :) 
    * ```
       let queryBuilder = new QueryBuilder<User>("user", true);
       const sortBuilder = queryBuilder.CreateSort();

       sortBuilder 
       .AddOrder("name", SortEnum.ASC)
        // this will be overriden cause this have the same root (order -> orderRequest)
        // than future .AddOrder("order.orderRequest.x", SortEnum) inline call
        .AddEntity("order")
        .AddEntity("orderRequest")
            .AddOrder("price", SortEnum.DESC)

        sortBuilder // this will be evalueted
            .AddOrder("order.orderRequest.dateRequest", SortEnum.ASC)
      ```
    */
    public AddOrder(field: keyof T, sort: SortEnum) {
        let isInline = false;
        let inlineField: any = null;
        if (field.toString().includes(".")) {
            inlineField = field.toString().split(".")[0];
            isInline = true;
        }
        
        let existentFieldIndex = this.complexField.Fields.findIndex(sortField => isInline && sortField.Name === inlineField || sortField.Name == field);
        if (existentFieldIndex != -1) {
            this.complexField.Fields.splice(existentFieldIndex, 1)
        }

        this.complexField.Fields.push(new SortField(field as string, sort));
        return this;
    }

}