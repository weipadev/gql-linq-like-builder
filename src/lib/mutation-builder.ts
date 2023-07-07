import { QueryParameter } from "../index";
import { Mutation } from "./mutation";

export class MutationBuilder {
    private mutation: Mutation;

    constructor(name: string) {
        this.mutation = new Mutation(name);
    }

  /**
   * Create a new parameter in the query.
   *
   * @param field - The field
   * @param value - The value
   * @returns This instance of MutationBuilder.
   *
  */
  public AddParameter(field: string, value: any): MutationBuilder {
    let param = new QueryParameter(field, value);
    this.mutation.Parameters.push(param);

    return this;
  }

    /**
   * Return the mutation object.
   *
   * @returns Return the mutation object.
   *
  */
    public GetMutation(): Mutation {
        return this.mutation;
      }
}