import { ColumnBuilder, QueryParameter, Subscription } from "../index";

export class SubscriptionBuilder<T = any>  {

    private subscription: Subscription;
    private alreadyInsertedColumns: ColumnBuilder<T>[] = [];

    constructor(name: string, topic: string) {
        this.subscription = new Subscription(name, topic);
    }

  /**
   * Creates a new column in the subscription.
   *
   * @param columnName - The column name in the database
   * @returns A new instance of ColumnBuilder
   *
  */
  public AddColumn(columnName: keyof T): SubscriptionBuilder<T> {
    new ColumnBuilder(this.subscription, columnName as string);

    return this;
  }

  /**
   * Creates a new column in the subscription.
   *
   * @param entityName - The column name in the database
   * @returns A new instance of ColumnBuilder
   *
  */
  public AddEntity<S = any>(entityName: keyof T): ColumnBuilder<S> {

    let column: ColumnBuilder<S | T> | undefined = this.alreadyInsertedColumns.find(e => e.column.Name === entityName);

    if (!column) {
      column = new ColumnBuilder<S>(this.subscription, entityName as string);
      this.alreadyInsertedColumns.push(column);
    }

    return column;
  }

  /**
   * Create a new parameter in the query.
   *
   * @param field - The field
   * @param value - The value
   * @returns This instance of SubscriptionBuilder<T>.
   *
  */
  public AddParameter(field: string, value: any): SubscriptionBuilder<T> {
    let param = new QueryParameter(field, value);
    this.subscription.Parameters.push(param);

    return this;
  }

  /**
   * Creates a navigation Entities and Columns in the query.
   *
   * @param entityName - The name of navigation separated by comma and dot for the properties (ex.: client.name,client.address.streetName)
   * @returns The instance of SubscriptionBuilder<T>
   *
  */
  public AddNavigation(name: string): SubscriptionBuilder<T> {

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
   * Return the subscription object.
   *
   * @returns Return the subscription object.
   *
  */
  public GetSubscription(): Subscription {
    return this.subscription;
  }

}