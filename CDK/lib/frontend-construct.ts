import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cfn from 'aws-cdk-lib/aws-cloudfront';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { CfnOutput, NestedStack, Duration } from 'aws-cdk-lib';
import { RestApiOrigin, S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';

interface BackendLayerProps {
    apigateway: apigw.RestApi
}

export class FrontendLayer extends NestedStack {
    private readonly S3BucketWebAppFrontend: s3.Bucket;
    private readonly Cloudfront: cfn.Distribution;

    constructor(scope: Construct, id: string, props: BackendLayerProps) {
        super(scope, id);

        this.S3BucketWebAppFrontend = new s3.Bucket(this, 'BucketFrontend', {
            accessControl: s3.BucketAccessControl.PRIVATE,
            bucketName: this.account + '-todowebappfrontend',
            encryption: s3.BucketEncryption.S3_MANAGED,
            versioned: true
        });

        const originAccessIdentity = new cfn.OriginAccessIdentity(this, 'OriginAccessIdentity');
        this.S3BucketWebAppFrontend.grantRead(originAccessIdentity);

        const OriginRegionShieldRegion = 'us-east-1';

        const cachePolicyToDoWebApp = new cfn.CachePolicy(this, 'ToDoWebAppCachePolicy', {
            cachePolicyName: 'ToDoWebAppCachePolicy',
            defaultTtl: Duration.seconds(2),
            minTtl: Duration.seconds(0),
            maxTtl: Duration.seconds(5),
        })

        this.Cloudfront = new cfn.Distribution(this, 'CloudfrontToDo', {
            defaultBehavior: {
                origin: new S3Origin(this.S3BucketWebAppFrontend, { 
                    originAccessIdentity: originAccessIdentity,
                    originShieldEnabled: true,
                    originShieldRegion: OriginRegionShieldRegion
                }),
                cachePolicy: cachePolicyToDoWebApp,
                viewerProtocolPolicy: cfn.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
            },
            additionalBehaviors: {
                "/v1/*": {
                    origin: new RestApiOrigin(props.apigateway, {
                        originShieldEnabled: true,
                        originShieldRegion: OriginRegionShieldRegion}),
                    allowedMethods: cfn.AllowedMethods.ALLOW_ALL,
                    cachePolicy: cachePolicyToDoWebApp,
                    compress: true,
                    viewerProtocolPolicy: cfn.ViewerProtocolPolicy.HTTPS_ONLY
                }
            },
            defaultRootObject: 'index.html',
            priceClass: cfn.PriceClass.PRICE_CLASS_100,
        });

        new CfnOutput(this, 'CloudFrontDomain', { value: 'http://' + this.Cloudfront.domainName });
        new CfnOutput(this, 'CloudFrontDomainAPI', { 
            value: 'https://' + this.Cloudfront.domainName + '/v1/todo'
        });
    }
}