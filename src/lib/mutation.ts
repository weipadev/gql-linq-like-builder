import { Query } from "./query";

export class Mutation extends Query {


    public override ToString(): string {
        let parameters = this.assembleParameters();
        parameters = parameters && parameters.length !== 0 ? `(${parameters})` : parameters;
    
        let query = `
        mutation {
            ${this.QueryName}${parameters}
          }`;
    
        return query;
    }

}