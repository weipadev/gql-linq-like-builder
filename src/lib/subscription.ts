import { Query } from "./query";

export class Subscription extends Query {

    TopicName: string;

    constructor(name: string, topic: string) {
        super(name)
        this.TopicName = topic;
    }

    public override ToString(): string {
        let parameters = this.assembleParameters();
        parameters = parameters && parameters.length !== 0 ? `(${parameters})` : parameters;
    
        let query = `
        subscription {
            ${this.QueryName}${parameters}{
              ${this.assembleColumns(this.Columns)}
            }
          }`;
    
        return query;
    }

    protected override assembleParameters(): string {
        let topic = this.assembleTopic();
        let subsParams = super.assembleParameters();

        return topic + ( subsParams.length !== 0 ? ", " : " ") + subsParams;
    }

    private assembleTopic() {
        let query = ""

        query += `topic: "${this.TopicName}"`;

        return query;
    }

}
/**
 * subscription{
                    onChangeOrder(topic: "orders_unit_${productionUnitId}_changed"){
                        id
                        productionOrderOperations {
                            id
                            operation {
                                id
                                code
                            }
                            startDateTime
                            finishDateTime
                        }
                        batchSerial {
                            id
                            code
                        }
                        serial {
                            id
                            code
                        }
                        product {
                          id
                          description
                          code
                        }
                        productionRecipe {
                          id
                        }
                        productionOrderStatus {
                          id
                          description
                        }
                        productDerivation {
                            id
                            unitAmount
                        }
                        producedAmount
                        requestedAmount
                    }
                }
 */