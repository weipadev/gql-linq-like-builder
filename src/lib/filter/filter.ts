import { ListMatchTypeEnum, MatchingTypes } from "../enums";
import { Operator } from "./filter-builder";

export class Filter {
    public Fields: (FilterField | FilterListField | ComplexFilterField)[] = [];
    public Operators: Operator[] = [];
}

export class FilterField {
    constructor(field: string, match: MatchingTypes, value: any) {
        this.Field = field;
        this.Match = match;
        this.Value = value;
    }

    public Field: string;
    public Value: any;
    public Match: MatchingTypes;
}

export class ComplexFilterField {
    constructor(name: string, listMatchType?: ListMatchTypeEnum) {
        this.Name = name;

        if (listMatchType) {
            this.ListMatchType = listMatchType;
        }
    }

    public Name: string; // parent name, ex: { parentName: { parentName: { filters } } }
    public Filters: (FilterField | FilterListField)[] = [];
    public ComplexChildren: ComplexFilterField[] = [];
    public ListMatchType: ListMatchTypeEnum = ListMatchTypeEnum.SOME;
    public Operators: Operator[] = [];
}

export class FilterListField {
    constructor(listField: string, match: ListMatchTypeEnum, filterField: FilterField) {
        this.ListField = listField;
        this.Match = match;
        this.FilterField = filterField;
    }

    public ListField: string;
    public Match: ListMatchTypeEnum;
    public FilterField: FilterField;
}