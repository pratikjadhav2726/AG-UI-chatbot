import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export interface GenerativeUiChatStackProps extends cdk.StackProps {
  domainName?: string;
  certificateArn?: string;
  environment: string;
}

export class GenerativeUiChatStack extends cdk.Stack {
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer;
  public readonly fargateService: ecsPatterns.ApplicationLoadBalancedFargateService;
  public readonly vpcOrigin: origins.VpcOrigin;
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: GenerativeUiChatStackProps) {
    super(scope, id, props);

    // Create VPC with public and private subnets
    this.vpc = new ec2.Vpc(this, 'GenerativeUiChatVpc', {
      maxAzs: 2,
      natGateways: 1, // Cost optimization: single NAT gateway
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
      vpc: this.vpc,
      clusterName: `generative-ui-chat-${props.environment}`,
      containerInsights: true,
    });

    // Create IAM role for ECS tasks with comprehensive Bedrock permissions
    const taskRole = new iam.Role(this, 'GenerativeUiChatTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'IAM role for Generative UI Chat ECS tasks with full Bedrock access',
      managedPolicies: [
        // Add CloudWatch logs permissions for application logging
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'),
      ],
      inlinePolicies: {
        BedrockFullAccess: new iam.PolicyDocument({
          statements: [
            // Bedrock model invocation permissions
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:InvokeModel',
                'bedrock:InvokeModelWithResponseStream',
              ],
              resources: [
                'arn:aws:bedrock:*::foundation-model/*',
                'arn:aws:bedrock:*:*:inference-profile/*',
              ],
            }),
            // Bedrock inference profile management permissions
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:GetInferenceProfile',
                'bedrock:ListInferenceProfiles',
              ],
              resources: [
                'arn:aws:bedrock:*:*:inference-profile/*',
              ],
            }),
            // Bedrock Agent access (if needed)
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:InvokeAgent',
                'bedrock:GetAgent',
                'bedrock:ListAgents',
              ],
              resources: [
                `arn:aws:bedrock:${this.region}:${this.account}:agent/*`,
              ],
            }),
            // CloudWatch Logs access for application logging
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
                'logs:DescribeLogGroups',
                'logs:DescribeLogStreams',
              ],
              resources: [
                `arn:aws:logs:${this.region}:${this.account}:log-group:/ecs/generative-ui-chat-${props.environment}*`,
                `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/ecs/generative-ui-chat-${props.environment}*`,
              ],
            }),
          ],
        }),
      },
    });

    // Create execution role for ECS tasks with enhanced logging permissions
    const executionRole = new iam.Role(this, 'GenerativeUiChatExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'ECS Task Execution Role with enhanced CloudWatch logging',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
      inlinePolicies: {
        EnhancedLogging: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
                'logs:DescribeLogGroups',
                'logs:DescribeLogStreams',
              ],
              resources: [
                `arn:aws:logs:${this.region}:${this.account}:log-group:/ecs/generative-ui-chat-${props.environment}*`,
              ],
            }),
          ],
        }),
      },
    });

    // Create CloudWatch Log Group with enhanced configuration
    const logGroup = new logs.LogGroup(this, 'GenerativeUiChatLogGroup', {
      logGroupName: `/ecs/generative-ui-chat-${props.environment}`,
      retention: logs.RetentionDays.TWO_WEEKS, // Extended retention for better debugging
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create additional log group for application-specific logs
    const appLogGroup = new logs.LogGroup(this, 'GenerativeUiChatAppLogGroup', {
      logGroupName: `/aws/ecs/generative-ui-chat-${props.environment}/app`,
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create Fargate Service with Application Load Balancer
    this.fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'GenerativeUiChatService', {
      cluster,
      serviceName: `generative-ui-chat-${props.environment}`,
      cpu: 1024, // 1 vCPU
      memoryLimitMiB: 2048, // 2 GB RAM
      desiredCount: 2, // Explicitly set desired count for CDK v2
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
          AWS_DEFAULT_REGION: this.region,
          PORT: '3000',
          // Explicitly disable AWS SDK credential chain that looks for access keys
          AWS_SDK_LOAD_CONFIG: '1',
          // Force AWS SDK to use IAM role credentials
          AWS_EC2_METADATA_DISABLED: 'false',
          // Application-specific environment variables
          LOG_LEVEL: 'info',
          BEDROCK_REGION: this.region,
        },
        logDriver: ecs.LogDrivers.awsLogs({
          streamPrefix: 'generative-ui-chat',
          logGroup,
          datetimeFormat: '%Y-%m-%d %H:%M:%S',
          multilinePattern: '^\\d{4}-\\d{2}-\\d{2}',
        }),
      },
      publicLoadBalancer: false, // Private ALB since CloudFront will access via VPC Origin
      listenerPort: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      domainName: props.domainName,
      domainZone: props.domainName ? route53.HostedZone.fromLookup(this, 'Zone', {
        domainName: props.domainName,
      }) : undefined,
      certificate: props.certificateArn ? acm.Certificate.fromCertificateArn(this, 'Certificate', props.certificateArn) : undefined,
    });

    // Store reference to load balancer for cross-stack access
    this.loadBalancer = this.fargateService.loadBalancer;

    // Create VPC Origin for CloudFront (in same stack as ALB to avoid deletion issues)
    this.vpcOrigin = origins.VpcOrigin.withApplicationLoadBalancer(this.loadBalancer, {
      vpcOriginName: `generative-ui-chat-vpc-origin-${props.environment}`,
      httpPort: 80,
      httpsPort: 443,
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
      connectionAttempts: 3,
      connectionTimeout: cdk.Duration.seconds(10),
      readTimeout: cdk.Duration.seconds(30),
      keepaliveTimeout: cdk.Duration.seconds(5),
      originSslProtocols: [cloudfront.OriginSslPolicy.TLS_V1_2],
      customHeaders: {
        'X-CloudFront-Origin': 'vpc-origin'
      }
    });

    // Configure health check
    this.fargateService.targetGroup.configureHealthCheck({
      path: '/api/health',
      healthyHttpCodes: '200',
      interval: cdk.Duration.seconds(30),
      timeout: cdk.Duration.seconds(5),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 3,
    });

    // Configure auto scaling
    const scalableTarget = this.fargateService.service.autoScaleTaskCount({
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

    // Outputs for cross-stack references
    new cdk.CfnOutput(this, 'LoadBalancerArn', {
      value: this.loadBalancer.loadBalancerArn,
      description: 'Application Load Balancer ARN',
      exportName: `GenerativeUiChat-${props.environment}-LoadBalancerArn`,
    });

    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: this.loadBalancer.loadBalancerDnsName,
      description: 'Application Load Balancer DNS name',
      exportName: `GenerativeUiChat-${props.environment}-LoadBalancerDNS`,
    });

    new cdk.CfnOutput(this, 'LoadBalancerSecurityGroupId', {
      value: this.fargateService.loadBalancer.connections.securityGroups[0].securityGroupId,
      description: 'Application Load Balancer Security Group ID',
      exportName: `GenerativeUiChat-${props.environment}-LoadBalancerSecurityGroupId`,
    });

    new cdk.CfnOutput(this, 'VpcOriginId', {
      value: `vpc-origin-${props.environment}`,
      description: 'VPC Origin ID for CloudFront',
      exportName: `GenerativeUiChat-${props.environment}-VpcOriginId`,
    });

    new cdk.CfnOutput(this, 'ECSClusterName', {
      value: cluster.clusterName,
      description: 'ECS Cluster Name',
      exportName: `GenerativeUiChat-${props.environment}-ECSClusterName`,
    });

    new cdk.CfnOutput(this, 'ECSServiceName', {
      value: this.fargateService.service.serviceName,
      description: 'ECS Service Name',
      exportName: `GenerativeUiChat-${props.environment}-ECSServiceName`,
    });

    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      description: 'VPC ID',
      exportName: `GenerativeUiChat-${props.environment}-VpcId`,
    });

    new cdk.CfnOutput(this, 'LogGroupName', {
      value: logGroup.logGroupName,
      description: 'CloudWatch Log Group Name',
      exportName: `GenerativeUiChat-${props.environment}-LogGroupName`,
    });

    new cdk.CfnOutput(this, 'AppLogGroupName', {
      value: appLogGroup.logGroupName,
      description: 'Application CloudWatch Log Group Name',
      exportName: `GenerativeUiChat-${props.environment}-AppLogGroupName`,
    });

    new cdk.CfnOutput(this, 'TaskRoleArn', {
      value: taskRole.roleArn,
      description: 'ECS Task Role ARN',
      exportName: `GenerativeUiChat-${props.environment}-TaskRoleArn`,
    });

    // Tags
    cdk.Tags.of(this).add('Project', 'GenerativeUiChat');
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
    cdk.Tags.of(this).add('Component', 'Application');
  }
}
