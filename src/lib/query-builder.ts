import { ColumnBuilder } from "./column/column-builder";
import { SortEnum } from "./enums";
import { FilterBuilder } from "./filter/filter-builder";
import { Query, QueryParameter } from "./query";

export class QueryBuilder {
  private query: Query;
  private alreadyInsertedColumns: ColumnBuilder[] = [];
  constructor(queryName: string, isCollection: boolean = true, getCount: boolean = false, parameters?: QueryParameter[]) {
    this.query = new Query(queryName);
    this.query.IsCollection = isCollection;
    this.query.WithCount = getCount;

    if (parameters) {
      this.query.Parameters = parameters;
    }
  }

  //#region Members :: AddColumn(), AddEntity(), AddNavigation(), AddPagination(), AddSort(), AddParameter(), AddQuery()

  /**
   * Creates a new column in the query.
   *
   * @param columnName - The column name in the database
   * @returns A new instance of ColumnBuilder
   *
  */
  public AddColumn(columnName: string): QueryBuilder {
    new ColumnBuilder(this.query, columnName);

    return this;
  }

  /**
   * Creates a new column in the query.
   *
   * @param entityName - The column name in the database
   * @returns A new instance of ColumnBuilder
   *
  */
  public AddEntity(entityName: string): ColumnBuilder {

    let column = this.alreadyInsertedColumns.find(e => e.column.Name === entityName);

    if (!column) {
      column = new ColumnBuilder(this.query, entityName);
      this.alreadyInsertedColumns.push(column);
    }

    return column;
  }

  /**
   * Creates a navigation Entities and Columns in the query.
   *
   * @param entityName - The name of navigation separated by comma and dot for the properties (ex.: client.name,client.address.streetName)
   * @returns The instance of QueryBuilder
   *
  */
  public AddNavigation(name: string): QueryBuilder {

    let viewColumns = name.split(",");
    let self = this;

    viewColumns.forEach(viewColumn => {
      let names = viewColumn.split(".");

      if (names.length > 1) {

        let dataColumn: any = null;
        names.forEach(function (columnName, index, array) {

          if (index === array.length - 1) {
            dataColumn.AddColumn(columnName);
          }
          else {
            if (dataColumn) {
              dataColumn = dataColumn.AddEntity(columnName);
            }
            else {
              dataColumn = self.AddEntity(columnName);
            }
          }
        });
      }
      else {
        const columnName = names[0];
        self.AddColumn(columnName);
      }
    });

    return this;
  }

  /**
   * Creates the pagination parameter in the query.
   *
   * @param skip - The number of results to skip
   * @param take - The number of results to take
   * @returns This instance of QueryBuilder.
   *
  */
  public AddPagination(skip: number, take: number): QueryBuilder {
    this.query.Pagination = [];

    this.query.Pagination.push(new QueryParameter("skip", skip));
    this.query.Pagination.push(new QueryParameter("take", take));

    return this;
  }

  /**
   * Create the sort parameter in the query.
   *
   * @param field - The field to sort by
   * @param value - The SortEnum value
   * @returns This instance of QueryBuilder.
   *
  */
  public AddSort(field: string, value: SortEnum): QueryBuilder {
    this.query.Sort.push(new QueryParameter(field, value));

    return this;
  }

  /**
   * Create a new parameter in the query.
   *
   * @param field - The field
   * @param value - The value
   * @returns This instance of QueryBuilder.
   *
  */
  public AddParameter(field: string, value: any): QueryBuilder {
    let param = new QueryParameter(field, value);
    this.query.Parameters.push(param);

    return this;
  }

  /**
   * Add another query to execution
   *
   * @param queryBuilder - The query builder to add
   * @returns This instance of QueryBuilder.
   *
  */
  public AddQuery(queryBuilder: QueryBuilder) {

    let query = queryBuilder.GetQuery();
    query.IsSubQuery = true;

    this.query.Queries.push(query);

    return this;
  }

  //#endregion

  //#region Members :: CreateFilter()

  /**
   * Return the instance of FilterBuilder.
   *
   * @returns Return the instance of FilterBuilder.
   *
  */
  public CreateFilter(): FilterBuilder {

    let filterBuilder = new FilterBuilder(this.query);

    return filterBuilder;
  }

  //#endregion

  //#region Members :: GetQuery()

  /**
   * Return the query object.
   *
   * @returns Return the query object.
   *
  */
  public GetQuery(): Query {
    return this.query;
  }

  //#endregion

  //#region Members :: HasSort()

  /**
*	Already have sorting?
**/
  public HasSort() {
    return this.query.Sort.length > 0;
  }

  //#endregion
}