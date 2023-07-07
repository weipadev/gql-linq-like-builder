import { Query } from "../query";
import { Column } from "./column";

export class ColumnBuilder<T = any> {
  public column: Column;
  private parent: Query | Column;

  constructor(parentEntity: Query | Column, name: string) {
    this.column = new Column(name);
    this.parent = parentEntity;

    if (this.parent instanceof Query) {
      this.parent.Columns.push(this.column);
    } else if (this.parent instanceof Column) {
      this.parent?.Children?.push(this.column);
    }
  }

  /**
   * Creates a new column in the query.
   *
   * @param columnName - The column name in the database
   * @returns This instance of ColumnBuilder
   *
  */
  public AddColumn(columnName: keyof T): ColumnBuilder<T> {
    let child: Column = new Column(columnName as string);
    this.column?.Children?.push(child);

    return this;
  }

  /**
   * Creates a new column in the query.
   *
   * @param entityName - The column name in the database that have children
   * @returns A new instance of ColumnBuilder
   *
  */
  public AddEntity<S = any>(entityName: keyof T): ColumnBuilder<S> {
    let column = new ColumnBuilder<S>(this.column, entityName as string);

    return column;
  }
}
