import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DataLayer } from './data-construct';
import { BackendLayer } from './backend-construct';
import { FrontendLayer } from './frontend-construct';

export class mainStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const data = new DataLayer(this, 'DataLayer');

    const backend = new BackendLayer(this, 'BackendLayer', {
      DBTable: data.table
    })

    const frontend = new FrontendLayer(this, 'FrontendLayer', {
      apigateway: backend.APIGateway
    })
  
  }
}
