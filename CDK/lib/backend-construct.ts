import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { CfnOutput, NestedStack } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';

interface DataLayerProps {
    readonly DBTable: dynamodb.ITable
}

export class BackendLayer extends NestedStack {
    private readonly functionGETAll: lambda.Function;
    private readonly functionPOST: lambda.Function;
    private readonly functionPUT: lambda.Function;
    private readonly functionDELETE: lambda.Function;
    public readonly APIGateway: apigw.RestApi;

    constructor(scope: Construct, id: string, props: DataLayerProps) {
        super(scope, id);

        const bucketLambdas = s3.Bucket.fromBucketName(this, 'BucketLambdas', '646515679322-todowebappbackend');

        this.functionGETAll = new lambda.Function(this, 'getAllToDo-function', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'LambdaFunctionGETAll.handler',
            code: lambda.Code.fromBucket(bucketLambdas, 'LambdaFunctionGETAll.zip'),
            environment: {
                TABLE_NAME: props.DBTable.tableName
            }
        });
        
        this.functionPOST = new lambda.Function(this, 'postToDo-function', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'LambdaFunctionPOST.handler',
            code: lambda.Code.fromBucket(bucketLambdas, 'LambdaFunctionPOST.zip'),
            environment: {
                TABLE_NAME: props.DBTable.tableName
            }
        });

        this.functionPUT = new lambda.Function(this, 'putToDo-function', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'LambdaFunctionPUT.handler',
            code: lambda.Code.fromBucket(bucketLambdas, 'LambdaFunctionPUT.zip'),
            environment: {
                TABLE_NAME: props.DBTable.tableName
            }
        });

        this.functionDELETE = new lambda.Function(this, 'deleteToDo-function', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'LambdaFunctionDELETE.handler',
            code: lambda.Code.fromBucket(bucketLambdas, 'LambdaFunctionDELETE.zip'),
            environment: {
                TABLE_NAME: props.DBTable.tableName
            }
        });

        props.DBTable.grant(this.functionGETAll, "dynamodb:BatchGetItem", "dynamodb:DescribeTable", "dynamodb:GetItem", "dynamodb:Query", "dynamodb:Scan");
        props.DBTable.grant(this.functionPOST, "dynamodb:BatchWriteItem", "dynamodb:PutItem");
        props.DBTable.grant(this.functionPUT, "dynamodb:UpdateItem");
        props.DBTable.grant(this.functionDELETE, "dynamodb:DeleteItem");

        this.APIGateway = new apigw.RestApi(this, 'APIGatewayToDo', {
            deployOptions: {
                stageName: 'api',
            }
        });

        const ResourceV1 = this.APIGateway.root.addResource('v1');
        const ResourceToDo = ResourceV1.addResource('todo');
        ResourceToDo.addMethod('GET', new apigw.LambdaIntegration(this.functionGETAll), {
            authorizationType: apigw.AuthorizationType.NONE
        });
        ResourceToDo.addMethod('POST', new apigw.LambdaIntegration(this.functionPOST), {
            authorizationType: apigw.AuthorizationType.NONE
        });
        ResourceToDo.addMethod('PUT', new apigw.LambdaIntegration(this.functionPUT), {
            authorizationType: apigw.AuthorizationType.NONE
        });
        ResourceToDo.addMethod('DELETE', new apigw.LambdaIntegration(this.functionDELETE), {
            authorizationType: apigw.AuthorizationType.NONE
        });
    }
}