import { ColumnBuilder } from "./column/column-builder";
import { SortEnum } from "./enums";
import { FilterBuilder } from "./filter/filter-builder";
import { Query, QueryParameter } from "./query";
import { SortBuilder } from "./sort/sort-builder";

export class QueryBuilder<T = any> {
  private query: Query;
  private alreadyInsertedColumns: ColumnBuilder<T>[] = [];

  constructor(queryName: string, isCollection: boolean = true, getCount: boolean = false, parameters?: QueryParameter[]) {
    this.query = new Query(queryName);
    this.query.IsCollection = isCollection;
    this.query.WithCount = getCount;

    if (parameters) {
      this.query.Parameters = parameters;
    }
  }

  /**
   * Creates a new column in the query.
   *
   * @param columnName - The column name in the database
   * @returns A new instance of ColumnBuilder
   *
  */
  public AddColumn(columnName: keyof T): QueryBuilder<T> {
    new ColumnBuilder(this.query, columnName as string);

    return this;
  }

  /**
   * Creates a new column in the query.
   *
   * @param entityName - The column name in the database
   * @returns A new instance of ColumnBuilder
   *
  */
  public AddEntity<S = any>(entityName: keyof T): ColumnBuilder<S> {

    let column: ColumnBuilder<S | T> | undefined = this.alreadyInsertedColumns.find(e => e.column.Name === entityName);

    if (!column) {
      column = new ColumnBuilder<S>(this.query, entityName as string);
      this.alreadyInsertedColumns.push(column);
    }

    return column;
  }

  /**
   * Creates a navigation Entities and Columns in the query.
   *
   * @param entityName - The name of navigation separated by comma and dot for the properties (ex.: client.name,client.address.streetName)
   * @returns The instance of QueryBuilder<T>
   *
  */
  public AddNavigation(name: string): QueryBuilder<T> {

    let viewColumns = name.split(",");
    let self = this;

    viewColumns.forEach(viewColumn => {
      let names = viewColumn.split(".");

      if (names.length > 1) {

        let dataColumn: any = null;
        names.forEach(function (columnName: any, index, array) {

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
        const columnName = names[0] as any;
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
   * @returns This instance of QueryBuilder<T>.
   *
  */
  public AddPagination(skip: number, take: number): QueryBuilder<T> {
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
   * @returns This instance of QueryBuilder<T>.
   * @deprecated `This method is deprecated, its no safety.`
   * Use {@link CreateSort()} instead to prevent errors and enable new features
   * like {@link SortBuilder | SortBuilder}
   * 
   * * `Property Repetition`: It may repeat the same property in `order`, which throws a error in request.
   *
  */
  public AddSort(field: keyof T, value: SortEnum): QueryBuilder<T> {
    
    const preSortIndex = this.query.Sort.findIndex(sort => sort.field === field);

    if (preSortIndex != -1) {
      this.query.Sort[preSortIndex] = new QueryParameter(field as string, value);
    } else {
      this.query.Sort.push(new QueryParameter(field as string, value));
    }

    return this;
  }

  public CreateSort() : SortBuilder<T> {

    let sortBuilder = new SortBuilder<T>(this.query);

    return sortBuilder;
  }
  
  /**
  *	Already have sorting?
  **/
  public HasSort() {
    // return this.query.Sort.length > 0;
  }

  /**
   * Create a new parameter in the query.
   *
   * @param field - The field
   * @param value - The value
   * @returns This instance of QueryBuilder<T>.
   *
  */
  public AddParameter(field: string, value: any): QueryBuilder<T> {
    let param = new QueryParameter(field, value);
    this.query.Parameters.push(param);

    return this;
  }

  /**
   * Return the instance of FilterBuilder.
   *
   * @returns Return the instance of FilterBuilder.
   *
  */
  public CreateFilter(): FilterBuilder<T> {

    let filterBuilder = new FilterBuilder<T>(this.query);

    return filterBuilder;
  }

  /**
   * Return the query object.
   *
   * @returns Return the query object.
   *
  */
  public GetQuery(): Query {
    return this.query;
  }
}