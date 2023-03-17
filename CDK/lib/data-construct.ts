import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { CfnOutput, NestedStack } from 'aws-cdk-lib';

export class DataLayer extends NestedStack {
    public readonly table: dynamodb.Table

    constructor(scope: Construct, id: string) {
        super(scope, id);

        const table = new dynamodb.Table(this, 'ToDoDatabase', {
            tableName: 'toDoItems',
            partitionKey: { 
                name: 'ID', 
                type: dynamodb.AttributeType.NUMBER 
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            readCapacity: 1,
            writeCapacity: 1
        });

        this.table = table;

        new CfnOutput(this, 'TableName', { value: this.table.tableName });
    }
}