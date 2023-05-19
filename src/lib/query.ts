import { Column } from "./column/column";
import { MatchTypeEnum } from "./enums";
import { ComplexFilterField, Filter, FilterField, FilterListField } from "./filter/filter";
import { Operator } from "./filter/filter-builder";

export class Query {

  public QueryName: string;
  public Parameters: QueryParameter[] = [];
  public Pagination: QueryParameter[] = [];
  public Sort: QueryParameter[] = [];
  public Filter: Filter;
  public Columns: Column[] = [];
  public IsCollection: boolean = true;
  public WithCount: boolean = false;

  public Queries: Query[] = [];
  public IsSubQuery: boolean = false;

  public constructor(queryName: string) {
    this.QueryName = queryName;
    this.Filter = new Filter();
  }

  //#region Members :: ToString()

  /**
     * Return the query string.
     *
     * @returns Return the query string.
     *
    */
  public ToString(): string {
    let parameters = this.assembleParameters();
    parameters = parameters && parameters.length !== 0 ? `(${parameters})` : parameters;

    let query = `${this.QueryName}${parameters}\n{
      ${this.IsCollection ? `items{
        ${this.assembleColumns(this.Columns)}
      }, ${this.WithCount ? "totalCount" : ""}` : this.assembleColumns(this.Columns)}
    }`;

    if (this.Queries.length > 0) {
      this.Queries.forEach(otherQuery => {
        let queryString = otherQuery.ToString();
        query += `,\n\t\t${queryString}`;
      });
    }

    if (this.IsSubQuery) {
      return query;
    }
    else {
      return `{\n${query}\n}`;
    }
  }

  //#endregion

  //#region Members 'Assembling' :: assembleColumns(), assemblePagination(), assembleSort(), assembleParameters(), assembleComplexFields(), assembleFilterFields(), assembleFilterMember(), assembleField(), mountValue(), assembleChild()

  private assembleColumns(columns: Column[]): string {
    let queryColumns: string = "";

    columns.forEach((column, index) => {
      queryColumns += column.Name;

      if (column.Children && column.Children.length > 0) {
        queryColumns += ` {${this.assembleColumns(column.Children)}} `;

      }

      if (index + 1 < columns.length) {
        queryColumns += ", ";
      }
    });

    return queryColumns;
  }

  private assemblePagination(queryParameters?: string): string {
    if (this.Pagination) {
      this.Pagination.forEach((param, index) => {
        if (queryParameters && index == 0) {
          queryParameters += ", ";
        }

        queryParameters += `${param.field}: ${param.value}`;

        if (index < this.Pagination.length - 1) {
          queryParameters += ", ";
        }
      });
    }

    return this.assembleSort(queryParameters);
  }

  private assembleSort(queryParameters?: string): string {
    this.Sort.forEach((param, index) => {
      if (queryParameters) {
        queryParameters += ", ";
      }

      if (index == 0) {
        queryParameters += "order: [{";
      }

      // Funcionalidade até a construção do builder de sort.
      let splitedString = [];

      if (param.field.includes(".")) {
        splitedString = param.field.split(".");

        let closesCount = 0;
        splitedString.forEach((entity, index) => {

          if (index < splitedString.length - 1) {
            queryParameters += `${entity}: {`;
            closesCount++;
          } else {
            queryParameters += `${entity}: ${param.value}`;
          }

        });

        for (let i = 0; i < closesCount; i++) {
          queryParameters += "}";
        }
      } else {
        queryParameters += `${param.field}: ${param.value}`;
      }

      if (index < this.Sort.length - 1) {
        queryParameters += ", ";
      } else {
        queryParameters += "}]";
      }
    });

    return this.assembleFilterFields(queryParameters);
  }

  private assembleParameters(): string {
    let queryParameters: string = "";

    if (this.Parameters) {
      queryParameters = "";
    }

    this.Parameters.forEach((param, index) => {

      queryParameters += `${param.field}: `;

      if (typeof param.value == "number") {
        queryParameters += param.value;
      }
      else if (Array.isArray(param.value)) {

        if (param.value.length) {

          queryParameters += "[";

          param.value.forEach((value, index) => {
            queryParameters += value;

            if (index + 1 <= param.value.length) {
              queryParameters += ",";
            }
          });

          queryParameters += "]";
        }
        else {
          queryParameters += "[]";
        }
      }
      else {
        if (typeof param.value == "string")
          queryParameters += `"${param.value}"`;
        else
          queryParameters += `${param.value}`;
      }

      if (index < this.Parameters.length - 1) {
        queryParameters += ", ";
      }
    });

    return this.assemblePagination(queryParameters);
  }

  private assembleComplexFields(complexField: ComplexFilterField): string {
    let assembledComplexFields = `${complexField.Name}: {`;

    if (complexField.ListMatchType) {
      assembledComplexFields += `${complexField.ListMatchType}: {`;
    }

    if (complexField.Operators.length > 0) {
      assembledComplexFields += this.assembleOperators(complexField.Operators);
    }

    if (complexField.ComplexChildren.length > 0) {
      complexField.ComplexChildren.forEach(child => {
        assembledComplexFields += this.assembleComplexFields(child);
      });
    }

    if (complexField.Filters.length > 0) {
      if (complexField.ComplexChildren.length > 0) {
        assembledComplexFields += ", ";
      }

      complexField.Filters.forEach((filter, index) => {
        assembledComplexFields += this.assembleField(filter);

        if (index < complexField.Filters.length - 1) {
          assembledComplexFields += ", ";
        }
      });

    }

    if (complexField.ListMatchType) {
      assembledComplexFields += " }";
    }

    assembledComplexFields += "}";
    return assembledComplexFields;
  }

  private assembleFilterFields(queryParameters?: string): any {
    queryParameters += queryParameters != "" ? ", " : "";

    if (this.Filter.Fields.length > 0 || this.Filter.Operators.length > 0) {
      queryParameters += "where: {";

      if (this.Filter.Fields.length > 0) {
        this.Filter.Fields.forEach((item, index) => {
          queryParameters += this.assembleField(item);

          if (index < this.Filter.Fields.length - 1) {
            queryParameters += ", ";
          }
        });
      }

      if (this.Filter.Operators.length > 0) {
        queryParameters += this.Filter.Fields.length > 0 ? ", " : "";
        queryParameters += this.assembleOperator();
      }

      queryParameters += "}";
    }

    return queryParameters;
  }

  private assembleFilterMember(items: any[], withBrackets = false) {
    let filters = "";

    items.forEach((element: any, index: number) => {
      filters += withBrackets ? "{" : "";

      filters += this.assembleField(element);

      filters += withBrackets ? "}" : "";

      if (index < items.length - 1) {
        filters += ", ";
      }
    });

    return filters;
  }

  private assembleField(field: FilterField | FilterListField | ComplexFilterField): any {
    if (field instanceof FilterField) {
      let splitedString = [];
      if (field.Field.includes(".")) {

        let matchArray = field.Match === MatchTypeEnum.IN || field.Match === MatchTypeEnum.NOT_IN;
        splitedString = field.Field.split(".");

        let assembledFilter = "";
        let closesCount = 0;
        splitedString.forEach((entity, index) => {
          if (index < splitedString.length - 1) {
            assembledFilter += `${entity}: { `;
            closesCount++;
          } else {
            assembledFilter += `
              ${entity}: {
                ${field.Match}: ${this.mountValue(field.Value, matchArray)}
            }`;

            for (let i = 0; i < closesCount; i++) {
              assembledFilter += " }";
            }
          }
        });
        return assembledFilter;
      }
      let matchArray = field.Match === MatchTypeEnum.IN || field.Match === MatchTypeEnum.NOT_IN;
      return `${field.Field}: {
        ${field.Match}: ${this.mountValue(field.Value, matchArray)}
      }`;
    } else if (field instanceof FilterListField) {
      let matchArray = field.FilterField.Match === MatchTypeEnum.IN || field.FilterField.Match === MatchTypeEnum.NOT_IN;
      return `
        ${field.ListField}: {
          ${field.Match}: {
            ${field.FilterField.Field}: {
              ${field.FilterField.Match}: ${this.mountValue(field.FilterField.Value, matchArray)}
            }
          }
        }`;
    } else if (field instanceof ComplexFilterField) {
      if (field) {
        return this.assembleComplexFields(field);
      }
    }
  }

  private mountValue(value: any, isArray: boolean) {

    if (isArray) {
      return `[${typeof value[0] === "string" ? `"${value}"` : value}]`;
    } else {
      return `${typeof value === "string" ? `"${value}"` : value}`;
    }
  }

  private assembleChild(children: any) {
    let assembled = "";
    children.forEach((child: Operator | Filter, index: number) => {
      if (child instanceof Operator) {
        assembled += `{${child.type}: [${this.assembleChild(child.children)}`;
        assembled += this.assembleFilterMember(child.filters, true);
        assembled += "]}";
      }
      else if (child instanceof Filter) {
        assembled += this.assembleFilterMember(child.Fields, true);
      }

      if (index < children.length - 1) {
        assembled += ", ";
      }
    });

    return assembled;
  }

  //#endregion

  //#region Members 'Operators' :: assembleOperator(), assembleOperators()

  private assembleOperator() {
    let assembled = "";

    assembled += this.assembleOperators(this.Filter.Operators);
    // this.Filter.Operators.forEach((item, index) => {

    //   assembled += `${item.type}: [${this.assembleChild(item.children)}${item.children.length > 0 && item.filters.length > 0 ? ", " : ""}${this.assembleFilterMember(item.filters, true)}]`;

    //   if (index < this.Filter.Operators.length - 1) {
    //     assembled += ", ";
    //   }
    // });

    return assembled;
  }

  private assembleOperators(operators: Operator[]) {
    let assembled = "";
    operators.forEach((item, index) => {

      assembled += `${item.type}: [${this.assembleChild(item.children)}${item.children.length > 0 && item.filters.length > 0 ? ", " : ""}${this.assembleFilterMember(item.filters, true)}]`;

      if (index < operators.length - 1) {
        assembled += ", ";
      }
    });

    return assembled;
  }

  //#endregion
}

export class QueryParameter {

  public field: string;
  public value: any;

  constructor(field: string, value: any) {
    this.field = field;
    this.value = value;
  }
}

