import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
export interface GenerativeUiChatStackProps extends cdk.StackProps {
    domainName?: string;
    certificateArn?: string;
    environment: string;
}
export declare class GenerativeUiChatStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: GenerativeUiChatStackProps);
    private createHealthCheckEndpoint;
}
