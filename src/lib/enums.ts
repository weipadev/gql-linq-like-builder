export enum SortEnum {
    ASC = "ASC",
    DESC = "DESC"
}

export enum OperatorEnum {
    OR = "or",
    AND = "and",
}

export enum ListMatchTypeEnum {
    SOME = "some",
    ANY = "any",
    ALL = "all",
    NONE = "none"
}

export type MatchingTypes = MatchTypeEnum | StringMatchTypeEnum | NumberMatchTypeEnum;

export enum MatchTypeEnum {
    EQUALS = "eq",
    NOT_EQUALS = "neq",
    IN = "in",
    NOT_IN = "nin",
}

export enum StringMatchTypeEnum {
    CONTAINS = "contains",
    NOT_CONTAINS = "ncontains",
    STARTS_WITH = "startsWith",
    NOT_STARTS_WITH = "nstartsWith",
    ENDS_WITH = "endsWith",
    NOT_ENDS_WITH = "nendsWith",
}

export enum NumberMatchTypeEnum {
    GREATER_THAN = "gt",
    NOT_GREATER_THAN = "ngt",
    GREATER_THAN_OR_EQUALS = "gte",
    NOT_GREATER_THAN_OR_EQUALS = "ngte",
    LESS_THAN = "lt",
    NOT_LESS_THAN = "nlt",
    LESS_THAN_OR_EQUALS = "lte",
    NOT_LESS_THAN_OR_EQUALS = "nlte",
}