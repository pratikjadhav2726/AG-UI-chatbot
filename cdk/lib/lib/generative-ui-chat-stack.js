"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerativeUiChatStack = void 0;
const cdk = require("aws-cdk-lib");
const ec2 = require("aws-cdk-lib/aws-ec2");
const ecs = require("aws-cdk-lib/aws-ecs");
const ecsPatterns = require("aws-cdk-lib/aws-ecs-patterns");
const elbv2 = require("aws-cdk-lib/aws-elasticloadbalancingv2");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const origins = require("aws-cdk-lib/aws-cloudfront-origins");
const iam = require("aws-cdk-lib/aws-iam");
const logs = require("aws-cdk-lib/aws-logs");
const route53 = require("aws-cdk-lib/aws-route53");
const acm = require("aws-cdk-lib/aws-certificatemanager");
class GenerativeUiChatStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create VPC with public and private subnets
        const vpc = new ec2.Vpc(this, 'GenerativeUiChatVpc', {
            maxAzs: 2,
            natGateways: 1,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'Public',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: 'Private',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                },
            ],
        });
        // Create ECS Cluster
        const cluster = new ecs.Cluster(this, 'GenerativeUiChatCluster', {
            vpc,
            clusterName: `generative-ui-chat-${props.environment}`,
            containerInsights: true,
        });
        // Create IAM role for ECS tasks with Bedrock permissions
        const taskRole = new iam.Role(this, 'GenerativeUiChatTaskRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            description: 'IAM role for Generative UI Chat ECS tasks',
            inlinePolicies: {
                BedrockAccess: new iam.PolicyDocument({
                    statements: [
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: [
                                'bedrock:InvokeModel',
                                'bedrock:InvokeModelWithResponseStream',
                            ],
                            resources: [
                                `arn:aws:bedrock:${this.region}::foundation-model/anthropic.claude-4-sonnet-20250514-v1:0`,
                            ],
                        }),
                    ],
                }),
            },
        });
        // Create execution role for ECS tasks
        const executionRole = new iam.Role(this, 'GenerativeUiChatExecutionRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
            ],
        });
        // Create CloudWatch Log Group
        const logGroup = new logs.LogGroup(this, 'GenerativeUiChatLogGroup', {
            logGroupName: `/ecs/generative-ui-chat-${props.environment}`,
            retention: logs.RetentionDays.ONE_WEEK,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        // Create Fargate Service with Application Load Balancer
        const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'GenerativeUiChatService', {
            cluster,
            serviceName: `generative-ui-chat-${props.environment}`,
            cpu: 1024,
            memoryLimitMiB: 2048,
            desiredCount: 2,
            taskImageOptions: {
                image: ecs.ContainerImage.fromAsset('..', {
                    file: 'Dockerfile',
                }),
                containerPort: 3000,
                taskRole,
                executionRole,
                environment: {
                    NODE_ENV: 'production',
                    AWS_REGION: this.region,
                    PORT: '3000',
                },
                logDriver: ecs.LogDrivers.awsLogs({
                    streamPrefix: 'generative-ui-chat',
                    logGroup,
                }),
            },
            publicLoadBalancer: false,
            listenerPort: 80,
            protocol: elbv2.ApplicationProtocol.HTTP,
            domainName: props.domainName,
            domainZone: props.domainName ? route53.HostedZone.fromLookup(this, 'Zone', {
                domainName: props.domainName,
            }) : undefined,
            certificate: props.certificateArn ? acm.Certificate.fromCertificateArn(this, 'Certificate', props.certificateArn) : undefined,
        });
        // Configure health check
        fargateService.targetGroup.configureHealthCheck({
            path: '/api/health',
            healthyHttpCodes: '200',
            interval: cdk.Duration.seconds(30),
            timeout: cdk.Duration.seconds(5),
            healthyThresholdCount: 2,
            unhealthyThresholdCount: 3,
        });
        // Configure auto scaling
        const scalableTarget = fargateService.service.autoScaleTaskCount({
            minCapacity: 2,
            maxCapacity: 10,
        });
        scalableTarget.scaleOnCpuUtilization('CpuScaling', {
            targetUtilizationPercent: 70,
            scaleInCooldown: cdk.Duration.minutes(5),
            scaleOutCooldown: cdk.Duration.minutes(2),
        });
        scalableTarget.scaleOnMemoryUtilization('MemoryScaling', {
            targetUtilizationPercent: 80,
            scaleInCooldown: cdk.Duration.minutes(5),
            scaleOutCooldown: cdk.Duration.minutes(2),
        });
        // Create CloudFront Distribution
        const distribution = new cloudfront.Distribution(this, 'GenerativeUiChatDistribution', {
            defaultBehavior: {
                origin: new origins.LoadBalancerV2Origin(fargateService.loadBalancer, {
                    protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
                    httpPort: 80,
                }),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
                cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
                originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
                compress: true,
            },
            additionalBehaviors: {
                '/api/*': {
                    origin: new origins.LoadBalancerV2Origin(fargateService.loadBalancer, {
                        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
                        httpPort: 80,
                    }),
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                    cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
                    originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
                },
                '/_next/static/*': {
                    origin: new origins.LoadBalancerV2Origin(fargateService.loadBalancer, {
                        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
                        httpPort: 80,
                    }),
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
                    compress: true,
                },
            },
            priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
            comment: `Generative UI Chat CloudFront Distribution - ${props.environment}`,
            enabled: true,
        });
        // Create health check endpoint for the application
        this.createHealthCheckEndpoint(fargateService);
        // Outputs
        new cdk.CfnOutput(this, 'LoadBalancerDNS', {
            value: fargateService.loadBalancer.loadBalancerDnsName,
            description: 'Application Load Balancer DNS name',
        });
        new cdk.CfnOutput(this, 'CloudFrontURL', {
            value: `https://${distribution.distributionDomainName}`,
            description: 'CloudFront Distribution URL',
        });
        new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
            value: distribution.distributionId,
            description: 'CloudFront Distribution ID',
        });
        new cdk.CfnOutput(this, 'ECSClusterName', {
            value: cluster.clusterName,
            description: 'ECS Cluster Name',
        });
        new cdk.CfnOutput(this, 'ECSServiceName', {
            value: fargateService.service.serviceName,
            description: 'ECS Service Name',
        });
        if (props.domainName) {
            new cdk.CfnOutput(this, 'CustomDomainURL', {
                value: `https://${props.domainName}`,
                description: 'Custom Domain URL',
            });
        }
    }
    createHealthCheckEndpoint(fargateService) {
        // The health check endpoint will be handled by the Next.js application
        // We'll create it in the Next.js app
    }
}
exports.GenerativeUiChatStack = GenerativeUiChatStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGl2ZS11aS1jaGF0LXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vZ2VuZXJhdGl2ZS11aS1jaGF0LXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQywyQ0FBMkM7QUFDM0MsMkNBQTJDO0FBQzNDLDREQUE0RDtBQUM1RCxnRUFBZ0U7QUFDaEUseURBQXlEO0FBQ3pELDhEQUE4RDtBQUM5RCwyQ0FBMkM7QUFDM0MsNkNBQTZDO0FBQzdDLG1EQUFtRDtBQUNuRCwwREFBMEQ7QUFVMUQsTUFBYSxxQkFBc0IsU0FBUSxHQUFHLENBQUMsS0FBSztJQUNsRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQWlDO1FBQ3pFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLDZDQUE2QztRQUM3QyxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQ25ELE1BQU0sRUFBRSxDQUFDO1lBQ1QsV0FBVyxFQUFFLENBQUM7WUFDZCxtQkFBbUIsRUFBRTtnQkFDbkI7b0JBQ0UsUUFBUSxFQUFFLEVBQUU7b0JBQ1osSUFBSSxFQUFFLFFBQVE7b0JBQ2QsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsTUFBTTtpQkFDbEM7Z0JBQ0Q7b0JBQ0UsUUFBUSxFQUFFLEVBQUU7b0JBQ1osSUFBSSxFQUFFLFNBQVM7b0JBQ2YsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsbUJBQW1CO2lCQUMvQzthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgscUJBQXFCO1FBQ3JCLE1BQU0sT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUU7WUFDL0QsR0FBRztZQUNILFdBQVcsRUFBRSxzQkFBc0IsS0FBSyxDQUFDLFdBQVcsRUFBRTtZQUN0RCxp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QUFDO1FBRUgsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUN4QyxLQUFLLEVBQUUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ3pDLFdBQVcsRUFBRSxrQkFBa0I7U0FDaEMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFO1lBQ3BCLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7Z0JBQ3pDLEtBQUssRUFBRSxXQUFXLEtBQUssQ0FBQyxVQUFVLEVBQUU7Z0JBQ3BDLFdBQVcsRUFBRSxtQkFBbUI7YUFDakMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRU8seUJBQXlCLENBQUMsY0FBaUU7UUFDakcsdUVBQXVFO1FBQ3ZFLHFDQUFxQztJQUN2QyxDQUFDO0NBQ0Y7QUFqTkQsc0RBaU5DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCAqIGFzIGVjcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWNzJztcbmltcG9ydCAqIGFzIGVjc1BhdHRlcm5zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lY3MtcGF0dGVybnMnO1xuaW1wb3J0ICogYXMgZWxidjIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjInO1xuaW1wb3J0ICogYXMgY2xvdWRmcm9udCBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udCc7XG5pbXBvcnQgKiBhcyBvcmlnaW5zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZGZyb250LW9yaWdpbnMnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0ICogYXMgbG9ncyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncyc7XG5pbXBvcnQgKiBhcyByb3V0ZTUzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1yb3V0ZTUzJztcbmltcG9ydCAqIGFzIGFjbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2VydGlmaWNhdGVtYW5hZ2VyJztcbmltcG9ydCAqIGFzIHRhcmdldHMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMtdGFyZ2V0cyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuZXhwb3J0IGludGVyZmFjZSBHZW5lcmF0aXZlVWlDaGF0U3RhY2tQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcbiAgZG9tYWluTmFtZT86IHN0cmluZztcbiAgY2VydGlmaWNhdGVBcm4/OiBzdHJpbmc7XG4gIGVudmlyb25tZW50OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBHZW5lcmF0aXZlVWlDaGF0U3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogR2VuZXJhdGl2ZVVpQ2hhdFN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIENyZWF0ZSBWUEMgd2l0aCBwdWJsaWMgYW5kIHByaXZhdGUgc3VibmV0c1xuICAgIGNvbnN0IHZwYyA9IG5ldyBlYzIuVnBjKHRoaXMsICdHZW5lcmF0aXZlVWlDaGF0VnBjJywge1xuICAgICAgbWF4QXpzOiAyLFxuICAgICAgbmF0R2F0ZXdheXM6IDEsIC8vIENvc3Qgb3B0aW1pemF0aW9uOiBzaW5nbGUgTkFUIGdhdGV3YXlcbiAgICAgIHN1Ym5ldENvbmZpZ3VyYXRpb246IFtcbiAgICAgICAge1xuICAgICAgICAgIGNpZHJNYXNrOiAyNCxcbiAgICAgICAgICBuYW1lOiAnUHVibGljJyxcbiAgICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUMsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBjaWRyTWFzazogMjQsXG4gICAgICAgICAgbmFtZTogJ1ByaXZhdGUnLFxuICAgICAgICAgIHN1Ym5ldFR5cGU6IGVjMi5TdWJuZXRUeXBlLlBSSVZBVEVfV0lUSF9FR1JFU1MsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIEVDUyBDbHVzdGVyXG4gICAgY29uc3QgY2x1c3RlciA9IG5ldyBlY3MuQ2x1c3Rlcih0aGlzLCAnR2VuZXJhdGl2ZVVpQ2hhdENsdXN0ZXInLCB7XG4gICAgICB2cGMsXG4gICAgICBjbHVzdGVyTmFtZTogYGdlbmVyYXRpdmUtdWktY2hhdC0ke3Byb3BzLmVudmlyb25tZW50fWAsXG4gICAgICBjb250YWluZXJJbnNpZ2h0czogdHJ1ZSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBJQU0gcm9sZSBmb3IgRUNTIHRhc2tzIHdpdGggQmVkcm9jayBwZXJtaXNzaW9uc1xuICAgIGNvbnN0IHRhc2tSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdHZW5lcmF0aXZlVWlDaGF0VGFza1JvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbCgnZWNzLXRhc2tzLmFtYXpvbmF3cy5jb20nKSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnSUFNIHJvbGUgZm9yIEdlbmVyYXRpdmUgVUkgQ2hhdCBFQ1MgdGFza3MnLFxuICAgICAgaW5saW5lUG9saWNpZXM6IHtcbiAgICAgICAgQmVkcm9ja0FjY2VzczogbmV3IGlhbS5Qb2xpY3lEb2N1bWVudCh7XG4gICAgICAgICAgc3RhdGVtZW50czogW1xuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAnYmVkcm9jazpJbnZva2VNb2RlbCcsXG4gICAgICAgICAgICAgICAgJ2JlZHJvY2s6SW52b2tlTW9kZWxXaXRoUmVzcG9uc2VTdHJlYW0nLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICByZXNvdXJjZXM6IFtcbiAgICAgICAgICAgICAgICBgYXJuOmF3czpiZWRyb2NrOiR7dGhpcy5yZWdpb259Ojpmb3VuZGF0aW9uLW1vZGVsL2FudGhyb3BpYy5jbGF1ZGUtNC1zb25uZXQtMjAyNTA1MTQtdjE6MGAsXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgZXhlY3V0aW9uIHJvbGUgZm9yIEVDUyB0YXNrc1xuICAgIGNvbnN0IGV4ZWN1dGlvblJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ0dlbmVyYXRpdmVVaUNoYXRFeGVjdXRpb25Sb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2Vjcy10YXNrcy5hbWF6b25hd3MuY29tJyksXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdzZXJ2aWNlLXJvbGUvQW1hem9uRUNTVGFza0V4ZWN1dGlvblJvbGVQb2xpY3knKSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgQ2xvdWRXYXRjaCBMb2cgR3JvdXBcbiAgICBjb25zdCBsb2dHcm91cCA9IG5ldyBsb2dzLkxvZ0dyb3VwKHRoaXMsICdHZW5lcmF0aXZlVWlDaGF0TG9nR3JvdXAnLCB7XG4gICAgICBsb2dHcm91cE5hbWU6IGAvZWNzL2dlbmVyYXRpdmUtdWktY2hhdC0ke3Byb3BzLmVudmlyb25tZW50fWAsXG4gICAgICByZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfV0VFSyxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgRmFyZ2F0ZSBTZXJ2aWNlIHdpdGggQXBwbGljYXRpb24gTG9hZCBCYWxhbmNlclxuICAgIGNvbnN0IGZhcmdhdGVTZXJ2aWNlID0gbmV3IGVjc1BhdHRlcm5zLkFwcGxpY2F0aW9uTG9hZEJhbGFuY2VkRmFyZ2F0ZVNlcnZpY2UodGhpcywgJ0dlbmVyYXRpdmVVaUNoYXRTZXJ2aWNlJywge1xuICAgICAgY2x1c3RlcixcbiAgICAgIHNlcnZpY2VOYW1lOiBgZ2VuZXJhdGl2ZS11aS1jaGF0LSR7cHJvcHMuZW52aXJvbm1lbnR9YCxcbiAgICAgIGNwdTogMTAyNCwgLy8gMSB2Q1BVXG4gICAgICBtZW1vcnlMaW1pdE1pQjogMjA0OCwgLy8gMiBHQiBSQU1cbiAgICAgIGRlc2lyZWRDb3VudDogMiwgLy8gRXhwbGljaXRseSBzZXQgZGVzaXJlZCBjb3VudCBmb3IgQ0RLIHYyXG4gICAgICB0YXNrSW1hZ2VPcHRpb25zOiB7XG4gICAgICAgIGltYWdlOiBlY3MuQ29udGFpbmVySW1hZ2UuZnJvbUFzc2V0KCcuLicsIHtcbiAgICAgICAgICBmaWxlOiAnRG9ja2VyZmlsZScsXG4gICAgICAgIH0pLFxuICAgICAgICBjb250YWluZXJQb3J0OiAzMDAwLFxuICAgICAgICB0YXNrUm9sZSxcbiAgICAgICAgZXhlY3V0aW9uUm9sZSxcbiAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLFxuICAgICAgICAgIEFXU19SRUdJT046IHRoaXMucmVnaW9uLFxuICAgICAgICAgIFBPUlQ6ICczMDAwJyxcbiAgICAgICAgfSxcbiAgICAgICAgbG9nRHJpdmVyOiBlY3MuTG9nRHJpdmVycy5hd3NMb2dzKHtcbiAgICAgICAgICBzdHJlYW1QcmVmaXg6ICdnZW5lcmF0aXZlLXVpLWNoYXQnLFxuICAgICAgICAgIGxvZ0dyb3VwLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgICBwdWJsaWNMb2FkQmFsYW5jZXI6IGZhbHNlLCAvLyBQcml2YXRlIEFMQlxuICAgICAgbGlzdGVuZXJQb3J0OiA4MCxcbiAgICAgIHByb3RvY29sOiBlbGJ2Mi5BcHBsaWNhdGlvblByb3RvY29sLkhUVFAsXG4gICAgICBkb21haW5OYW1lOiBwcm9wcy5kb21haW5OYW1lLFxuICAgICAgZG9tYWluWm9uZTogcHJvcHMuZG9tYWluTmFtZSA/IHJvdXRlNTMuSG9zdGVkWm9uZS5mcm9tTG9va3VwKHRoaXMsICdab25lJywge1xuICAgICAgICBkb21haW5OYW1lOiBwcm9wcy5kb21haW5OYW1lLFxuICAgICAgfSkgOiB1bmRlZmluZWQsXG4gICAgICBjZXJ0aWZpY2F0ZTogcHJvcHMuY2VydGlmaWNhdGVBcm4gPyBhY20uQ2VydGlmaWNhdGUuZnJvbUNlcnRpZmljYXRlQXJuKHRoaXMsICdDZXJ0aWZpY2F0ZScsIHByb3BzLmNlcnRpZmljYXRlQXJuKSA6IHVuZGVmaW5lZCxcbiAgICB9KTtcblxuICAgIC8vIENvbmZpZ3VyZSBoZWFsdGggY2hlY2tcbiAgICBmYXJnYXRlU2VydmljZS50YXJnZXRHcm91cC5jb25maWd1cmVIZWFsdGhDaGVjayh7XG4gICAgICBwYXRoOiAnL2FwaS9oZWFsdGgnLFxuICAgICAgaGVhbHRoeUh0dHBDb2RlczogJzIwMCcsXG4gICAgICBpbnRlcnZhbDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoNSksXG4gICAgICBoZWFsdGh5VGhyZXNob2xkQ291bnQ6IDIsXG4gICAgICB1bmhlYWx0aHlUaHJlc2hvbGRDb3VudDogMyxcbiAgICB9KTtcblxuICAgIC8vIENvbmZpZ3VyZSBhdXRvIHNjYWxpbmdcbiAgICBjb25zdCBzY2FsYWJsZVRhcmdldCA9IGZhcmdhdGVTZXJ2aWNlLnNlcnZpY2UuYXV0b1NjYWxlVGFza0NvdW50KHtcbiAgICAgIG1pbkNhcGFjaXR5OiAyLFxuICAgICAgbWF4Q2FwYWNpdHk6IDEwLFxuICAgIH0pO1xuXG4gICAgc2NhbGFibGVUYXJnZXQuc2NhbGVPbkNwdVV0aWxpemF0aW9uKCdDcHVTY2FsaW5nJywge1xuICAgICAgdGFyZ2V0VXRpbGl6YXRpb25QZXJjZW50OiA3MCxcbiAgICAgIHNjYWxlSW5Db29sZG93bjogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgICBzY2FsZU91dENvb2xkb3duOiBjZGsuRHVyYXRpb24ubWludXRlcygyKSxcbiAgICB9KTtcblxuICAgIHNjYWxhYmxlVGFyZ2V0LnNjYWxlT25NZW1vcnlVdGlsaXphdGlvbignTWVtb3J5U2NhbGluZycsIHtcbiAgICAgIHRhcmdldFV0aWxpemF0aW9uUGVyY2VudDogODAsXG4gICAgICBzY2FsZUluQ29vbGRvd246IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgICAgc2NhbGVPdXRDb29sZG93bjogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMiksXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgQ2xvdWRGcm9udCBEaXN0cmlidXRpb25cbiAgICBjb25zdCBkaXN0cmlidXRpb24gPSBuZXcgY2xvdWRmcm9udC5EaXN0cmlidXRpb24odGhpcywgJ0dlbmVyYXRpdmVVaUNoYXREaXN0cmlidXRpb24nLCB7XG4gICAgICBkZWZhdWx0QmVoYXZpb3I6IHtcbiAgICAgICAgb3JpZ2luOiBuZXcgb3JpZ2lucy5Mb2FkQmFsYW5jZXJWMk9yaWdpbihmYXJnYXRlU2VydmljZS5sb2FkQmFsYW5jZXIsIHtcbiAgICAgICAgICBwcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5PcmlnaW5Qcm90b2NvbFBvbGljeS5IVFRQX09OTFksXG4gICAgICAgICAgaHR0cFBvcnQ6IDgwLFxuICAgICAgICB9KSxcbiAgICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IGNsb3VkZnJvbnQuVmlld2VyUHJvdG9jb2xQb2xpY3kuUkVESVJFQ1RfVE9fSFRUUFMsXG4gICAgICAgIGFsbG93ZWRNZXRob2RzOiBjbG91ZGZyb250LkFsbG93ZWRNZXRob2RzLkFMTE9XX0FMTCxcbiAgICAgICAgY2FjaGVkTWV0aG9kczogY2xvdWRmcm9udC5DYWNoZWRNZXRob2RzLkNBQ0hFX0dFVF9IRUFEX09QVElPTlMsXG4gICAgICAgIGNhY2hlUG9saWN5OiBjbG91ZGZyb250LkNhY2hlUG9saWN5LkNBQ0hJTkdfRElTQUJMRUQsIC8vIERpc2FibGUgY2FjaGluZyBmb3IgZHluYW1pYyBjb250ZW50XG4gICAgICAgIG9yaWdpblJlcXVlc3RQb2xpY3k6IGNsb3VkZnJvbnQuT3JpZ2luUmVxdWVzdFBvbGljeS5BTExfVklFV0VSLFxuICAgICAgICBjb21wcmVzczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBhZGRpdGlvbmFsQmVoYXZpb3JzOiB7XG4gICAgICAgICcvYXBpLyonOiB7XG4gICAgICAgICAgb3JpZ2luOiBuZXcgb3JpZ2lucy5Mb2FkQmFsYW5jZXJWMk9yaWdpbihmYXJnYXRlU2VydmljZS5sb2FkQmFsYW5jZXIsIHtcbiAgICAgICAgICAgIHByb3RvY29sUG9saWN5OiBjbG91ZGZyb250Lk9yaWdpblByb3RvY29sUG9saWN5LkhUVFBfT05MWSxcbiAgICAgICAgICAgIGh0dHBQb3J0OiA4MCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19BTEwsXG4gICAgICAgICAgY2FjaGVQb2xpY3k6IGNsb3VkZnJvbnQuQ2FjaGVQb2xpY3kuQ0FDSElOR19ESVNBQkxFRCxcbiAgICAgICAgICBvcmlnaW5SZXF1ZXN0UG9saWN5OiBjbG91ZGZyb250Lk9yaWdpblJlcXVlc3RQb2xpY3kuQUxMX1ZJRVdFUixcbiAgICAgICAgfSxcbiAgICAgICAgJy9fbmV4dC9zdGF0aWMvKic6IHtcbiAgICAgICAgICBvcmlnaW46IG5ldyBvcmlnaW5zLkxvYWRCYWxhbmNlclYyT3JpZ2luKGZhcmdhdGVTZXJ2aWNlLmxvYWRCYWxhbmNlciwge1xuICAgICAgICAgICAgcHJvdG9jb2xQb2xpY3k6IGNsb3VkZnJvbnQuT3JpZ2luUHJvdG9jb2xQb2xpY3kuSFRUUF9PTkxZLFxuICAgICAgICAgICAgaHR0cFBvcnQ6IDgwLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICAgIGNhY2hlUG9saWN5OiBjbG91ZGZyb250LkNhY2hlUG9saWN5LkNBQ0hJTkdfT1BUSU1JWkVELFxuICAgICAgICAgIGNvbXByZXNzOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHByaWNlQ2xhc3M6IGNsb3VkZnJvbnQuUHJpY2VDbGFzcy5QUklDRV9DTEFTU18xMDAsIC8vIENvc3Qgb3B0aW1pemF0aW9uXG4gICAgICBjb21tZW50OiBgR2VuZXJhdGl2ZSBVSSBDaGF0IENsb3VkRnJvbnQgRGlzdHJpYnV0aW9uIC0gJHtwcm9wcy5lbnZpcm9ubWVudH1gLFxuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBoZWFsdGggY2hlY2sgZW5kcG9pbnQgZm9yIHRoZSBhcHBsaWNhdGlvblxuICAgIHRoaXMuY3JlYXRlSGVhbHRoQ2hlY2tFbmRwb2ludChmYXJnYXRlU2VydmljZSk7XG5cbiAgICAvLyBPdXRwdXRzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0xvYWRCYWxhbmNlckROUycsIHtcbiAgICAgIHZhbHVlOiBmYXJnYXRlU2VydmljZS5sb2FkQmFsYW5jZXIubG9hZEJhbGFuY2VyRG5zTmFtZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQXBwbGljYXRpb24gTG9hZCBCYWxhbmNlciBETlMgbmFtZScsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQ2xvdWRGcm9udFVSTCcsIHtcbiAgICAgIHZhbHVlOiBgaHR0cHM6Ly8ke2Rpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25Eb21haW5OYW1lfWAsXG4gICAgICBkZXNjcmlwdGlvbjogJ0Nsb3VkRnJvbnQgRGlzdHJpYnV0aW9uIFVSTCcsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQ2xvdWRGcm9udERpc3RyaWJ1dGlvbklkJywge1xuICAgICAgdmFsdWU6IGRpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25JZCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ2xvdWRGcm9udCBEaXN0cmlidXRpb24gSUQnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0VDU0NsdXN0ZXJOYW1lJywge1xuICAgICAgdmFsdWU6IGNsdXN0ZXIuY2x1c3Rlck5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ0VDUyBDbHVzdGVyIE5hbWUnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0VDU1NlcnZpY2VOYW1lJywge1xuICAgICAgdmFsdWU6IGZhcmdhdGVTZXJ2aWNlLnNlcnZpY2Uuc2VydmljZU5hbWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ0VDUyBTZXJ2aWNlIE5hbWUnLFxuICAgIH0pO1xuXG4gICAgaWYgKHByb3BzLmRvbWFpbk5hbWUpIHtcbiAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdDdXN0b21Eb21haW5VUkwnLCB7XG4gICAgICAgIHZhbHVlOiBgaHR0cHM6Ly8ke3Byb3BzLmRvbWFpbk5hbWV9YCxcbiAgICAgICAgZGVzY3JpcHRpb246ICdDdXN0b20gRG9tYWluIFVSTCcsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUhlYWx0aENoZWNrRW5kcG9pbnQoZmFyZ2F0ZVNlcnZpY2U6IGVjc1BhdHRlcm5zLkFwcGxpY2F0aW9uTG9hZEJhbGFuY2VkRmFyZ2F0ZVNlcnZpY2UpIHtcbiAgICAvLyBUaGUgaGVhbHRoIGNoZWNrIGVuZHBvaW50IHdpbGwgYmUgaGFuZGxlZCBieSB0aGUgTmV4dC5qcyBhcHBsaWNhdGlvblxuICAgIC8vIFdlJ2xsIGNyZWF0ZSBpdCBpbiB0aGUgTmV4dC5qcyBhcHBcbiAgfVxufVxuIl19