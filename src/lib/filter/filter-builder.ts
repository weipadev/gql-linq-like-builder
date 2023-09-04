import { ListMatchTypeEnum, MatchingTypes, OperatorEnum } from "../enums";
import { Query } from "../query";
import { ComplexFilterField, Filter, FilterField, FilterListField } from "./filter";

// where: {field: {match: value}}
// or: [{field: {match: value}}, {field: {match: value}}]
// where: { or: [{  and:[{ or: [{id: {eq: 1}}, {name: {contains: "jo"}}], {id: {neq: null}}]}, {birthday: {eq: "12/12/2012"}}] }

export class Operator {
    public constructor(type: OperatorEnum, filters: FilterField[]) {
        this.type = type;
        this.filters = filters;
    }

    public type: OperatorEnum;
    public filters: (FilterField | ComplexFilterField | FilterListField)[] = [];
    public children: Operator[] = [];
}

export class FilterBuilder<T = any> {
    private parent: Query;
    private filter: Filter;
    operatorBuilder!: OperatorBuilder<T>;

    public constructor(parent: Query) {
        this.filter = new Filter();

        this.parent = parent;
        this.parent.Filter = this.filter;
    }

    /**
     * Creates a new filter operator field
     *
     * @param type - The type of operator
     * @param filters - The filters to apply to the operator
     * @returns A new instance of OperatorBuilder
     *
    */
    public AddOperator(type: OperatorEnum, filters: FilterField[] = []) : OperatorBuilder {

        let operatorIndex = this.filter.Operators.findIndex(o => o.type === type);

        if (operatorIndex < 0) {
            this.operatorBuilder = new OperatorBuilder<T>(this.filter, new Operator(type, filters));
        }

        return this.operatorBuilder;
    }

    /**
     * Creates a new filter field
     *
     * @param field - The field to filter by
     * @param match - The matching type
     * @param value - The value to filter by
     * @returns This instance of FilterBuilder
     *
    */
    public AddCondition(field: keyof T, match: MatchingTypes, value: any) {
        this.filter.Fields.push(new FilterField(field as string, match, value));
        return this;
    }

    /**
     * Creates a new filter field of list
     *
     * @param listField - The name of column list in database
     * @param match - The matching type of list
     * @return New instance of ComplexFieldBuilder
     *
    */
    public AddEntityList<S = any>(name: keyof T, match: ListMatchTypeEnum) {
        return new ComplexFieldBuilder<S>(this.filter, name as string, match);
    }

    /**
     * Creates a new complex field
     *
     * @param name - The name of column in database
     * @returns A new ComplexFieldBuilder instance
     *
    */
    public AddEntity<S = any>(name: keyof T) {
        return new ComplexFieldBuilder<S>(this.filter, name as string);
    }
}

export class OperatorBuilder<T = any> {
    private parent: Filter | Operator | ComplexFilterField;
    private operator: Operator;

    constructor(parent: Filter | Operator | ComplexFilterField, operator: Operator) {
        this.parent = parent;
        this.operator = operator;

        if (this.parent instanceof Filter) {
            this.parent.Operators.push(operator);
        } else if (this.parent instanceof Operator) {
            this.parent.children.push(operator);
        } else if (this.parent instanceof ComplexFilterField) {
            this.parent.Operators.push(operator);
        }
    }

    /**
     * Creates a new operator child in the operator.
     *
     * @param type - The operator child that will go into the other operator
     * @param fields - The list of fields to put into the operator field
     * @returns A new OperatorBuilder instance
     *
    */
    public AddOperatorChild(type: OperatorEnum, fields: FilterField[] = []) {
        return new OperatorBuilder(this.operator, new Operator(type, fields));
    }

    /**
     * Creates a new filter field in the operator.
     *
     * @param field - The field that corresponds to column in database
     * @param match - The match condition
     * @param value - The value to compair
     * @returns This builder
     *
    */
    public AddCondition(field: keyof T, match: MatchingTypes, value: any) {
        this.operator.filters.push(new FilterField(field as string, match, value));

        return this;
    }

    /**
     * Creates a new filter field in the operator.
     *
     * @param name - The name that corresponds to column list in database
     * @param match - The list match condition
     * @returns New ComplexFieldBuilder
     *
    */
    public AddEntityList<S = any>(name: keyof T, match: ListMatchTypeEnum) {
        return new ComplexFieldBuilder<S>(this.operator, name as string, match);
    }

    /**
     * Creates a new filter field in the operator.
     *
     * @param name - The name that corresponds to column list in database
     * @param match - The list match condition
     * @returns New ComplexFieldBuilder
     *
    */
    public AddEntity<S = any>(name: keyof T) {
        return new ComplexFieldBuilder<S>(this.operator, name as string);
    }
}

export class ComplexFieldBuilder<T = any> {
    private parent: Filter | ComplexFilterField | Operator;
    private complexField: ComplexFilterField;

    constructor(parent: Filter | ComplexFilterField | Operator, name: string, listMatchType?: ListMatchTypeEnum) {
        this.parent = parent;
        this.complexField = new ComplexFilterField(name, listMatchType);

        if (this.parent instanceof ComplexFilterField) {
            this.parent.ComplexChildren.push(this.complexField);
        } else if (this.parent instanceof Filter) {
            this.parent.Fields.push(this.complexField);
        } else if (this.parent instanceof Operator) {
            this.parent.filters.push(this.complexField);
        }
    }

    /**
     * Creates a new filter field of list in the query.
     *
     * @param name - The name of parent complex field
     * @returns A new instance of ComplexFieldBuilder
     *
    */
    public AddEntity<S = any>(name: keyof T) {

        return new ComplexFieldBuilder<S>(this.complexField, name as string);
    }

    /**
     * Creates a new filter field of list
     *
     * @param listField - The name of column list in database
     * @param match - The matching type of list
     * @param filterField - The field to filter
     * @returns This instance of FilterBuilder
     *
    */
    public AddEntityList<S = any>(name: keyof T, match: ListMatchTypeEnum) {
        return new ComplexFieldBuilder<S
        >(this.complexField, name as string, match);
    }

    /**
     * Creates a new filter field in the query.
     *
     * @param field - The field that corresponds to column in database
     * @param match - The match condition
     * @param value - The value to compair
     * @returns This builder
     *
    */
    public AddCondition(field: keyof T, match: MatchingTypes, value: any) {
        this.complexField.Filters.push(new FilterField(field as string, match, value));
        return this;
    }

    /**
     * Creates a new filter field of list in the query.
     *
     * @param listField - The field that corresponds to column list in database
     * @param match - The match condition
     * @param filterField - A new FilterField
     * @returns This instance of ComplexFieldBuilder
     *
    */
    public AddConditionWithList(listField: string, match: ListMatchTypeEnum, filterField: FilterField) {
        this.complexField.Filters.push(new FilterListField(listField, match, filterField));
        return this;
    }

    /**
     * Creates a new filter operator field
     *
     * @param type - The type of operator
     * @param filters - The filters to apply to the operator
     * @returns A new instance of OperatorBuilder
     *
    */
    public AddOperator(type: OperatorEnum, filters: FilterField[] = []) {
        return new OperatorBuilder(this.complexField, new Operator(type, filters));
    }
}
