import { SGDependencyAttributes } from "./../pages/SGDependencyPage/forms";
import Ec2 from "aws-sdk/clients/ec2";
import Elb from "aws-sdk/clients/elb";
import Elbv2 from "aws-sdk/clients/elbv2";
import Lambda from "aws-sdk/clients/lambda";
import Eks from "aws-sdk/clients/eks";
import Asg from "aws-sdk/clients/autoscaling";
import Rds from "aws-sdk/clients/rds";
import AWS from "aws-sdk";

export interface AWSCredentials {
    secretAccessKey: string;
    accessKeyId: string;
    region: string;
}

class URLGenerator {
    private region: string;
    constructor(region: string) {
        this.region = region;
    }

    ec2_url = (ec2_id: string) =>
        `https://${this.region}.console.aws.amazon.com/ec2/home?region=${this.region}#InstanceDetails:instanceId=${ec2_id}`;

    elb_url = (elb_name: string) =>
        `https://${this.region}.console.aws.amazon.com/ec2/home?region=${this.region}#LoadBalancers:search=${elb_name};sort=loadBalancerName`;

    lambda_url = (lambda_name: string) =>
        `https://${this.region}.console.aws.amazon.com/lambda/home?region=${this.region}#/functions?fo=and&k0=functionName&o0=%3D&v0=${lambda_name}`;

    eks_url = (eks_name: string) =>
        `https://${this.region}.console.aws.amazon.com/eks/home?region=${this.region}#/clusters/${eks_name}`;

    asg_url = (asg_name: string) =>
        `https://${this.region}.console.aws.amazon.com/ec2/home?region=${this.region}#AutoScalingGroupDetails:id=${asg_name};view=details`;

    rds_url = (rds_name: string) =>
        `https://${this.region}.console.aws.amazon.com/rds/home?region=${this.region}#database:id=${rds_name};is-cluster=false`;

    vpc_endpoint_url = (vpc_endpoint_id: string) =>
        `https://${this.region}.console.aws.amazon.com/vpc/home?region=${this.region}#Endpoints:search=${vpc_endpoint_id}`;

    nat_gateway_url = (nat_gateway_id: string) =>
        `https://${this.region}.console.aws.amazon.com/vpc/home?region=${this.region}#NatGateways:search=${nat_gateway_id}`;

    vpgw_url = (vpg_id: string) =>
        `https://${this.region}.console.aws.amazon.com/vpc/home?region=${this.region}#VpnGateways:VpnGatewayId=${vpg_id}`;

    eni_url = (eni_id: string) =>
        `https://${this.region}.console.aws.amazon.com/ec2/home?region=${this.region}#NIC:v=3;networkInterfaceId=${eni_id}`;

    acl_url = (acl_id: string) =>
        `https://${this.region}.console.aws.amazon.com/vpc/home?region=${this.region}#acls:networkAclId=${acl_id}`;

    igw_url = (igw_id: string) =>
        `https://${this.region}.console.aws.amazon.com/vpc/home?region=${this.region}#igws:internetGatewayId=${igw_id}`;

    route_table_url = (route_table_id: string) =>
        `https://${this.region}.console.aws.amazon.com/vpc/home?region=${this.region}#RouteTables:routeTableId=${route_table_id}`;

    subnet_url = (subnet_id: string) =>
        `https://${this.region}.console.aws.amazon.com/vpc/home?region=${this.region}#subnets:SubnetId=${subnet_id}`;
}

export class AWSHelper {
    private credentials: AWS.Credentials;
    private ec2: Ec2;
    private elb: Elb;
    private elbv2: Elbv2;
    private lambda: Lambda;
    private eks: Eks;
    private asg: Asg;
    private rds: Rds;
    public urlGenerator: URLGenerator;

    constructor({ secretAccessKey, accessKeyId, region }: AWSCredentials) {
        const credentials = new AWS.Credentials({
            secretAccessKey,
            accessKeyId,
        });

        this.credentials = credentials;

        this.ec2 = new Ec2({ credentials, region });
        this.elb = new Elb({ credentials, region });
        this.elbv2 = new Elbv2({ credentials, region });
        this.lambda = new Lambda({ credentials, region });
        this.eks = new Eks({ credentials, region });
        this.asg = new Asg({ credentials, region });
        this.rds = new Rds({ credentials, region });
        this.urlGenerator = new URLGenerator(region);
    }
    checkIfSgExists = (sgIds: string[]) =>
        this.ec2.describeSecurityGroups({
            GroupIds: sgIds,
        });

    getEnisOfSg = (sgIds: string[]) =>
        this.ec2
            .describeNetworkInterfaces({
                Filters: [{ Name: "group-id", Values: sgIds }],
            })
            .promise()
            .then((res) =>
                res.NetworkInterfaces?.map((eni) => eni.NetworkInterfaceId)
            );

    getVpcOfSg = (sgId: string) =>
        this.ec2
            .describeNetworkInterfaces({
                Filters: [{ Name: "group-id", Values: [sgId] }],
            })
            .promise()
            .then((res) => res.NetworkInterfaces)
            .then((networkInterfaces) =>
                networkInterfaces?.map((eni) => eni.VpcId)
            )
            .then((enis) =>
                enis?.filter(
                    (vpcId, index, self) => self.indexOf(vpcId) === index
                )
            );

    checkAsgInVpc = (asg: Asg.AutoScalingGroup, vpcIds: string[]) => {
        const subnetLists = asg.VPCZoneIdentifier?.split(",");
        return subnetLists?.some(
            async (subnet) =>
                await this.ec2
                    .describeSubnets({ SubnetIds: [subnet] })
                    .promise()
                    .then((res) => res.Subnets)
                    .then((subnetDescriptions) =>
                        vpcIds.includes(subnetDescriptions?.[0].VpcId!)
                    )
        );
    };

    describeAsgs = (vpcIds: string[]) =>
        this.asg
            .describeAutoScalingGroups()
            .promise()
            .then((res) => res.AutoScalingGroups)
            .then((asgs) =>
                asgs.filter((asg) => this.checkAsgInVpc(asg, vpcIds))
            )
            .then((asgs) => asgs.map((asg) => asg.AutoScalingGroupName));

    describeEc2s = (vpcIds: string[]) =>
        this.ec2
            .describeInstances({
                Filters: [{ Name: "vpc-id", Values: vpcIds }],
            })
            .promise()
            .then((res) => res.Reservations)
            .then((reservations) =>
                reservations
                    ?.map((reservation) =>
                        reservation.Instances?.map(
                            (instance) => instance.InstanceId
                        )
                    )
                    .flat()
            );

    describeEkss = async (vpcIds: string[]) => {
        const eksClusters = await this.eks
            .listClusters()
            .promise()
            .then((res) => res.clusters);
        const clusterDescriptions = await Promise.all(
            eksClusters?.map((eksCluster) =>
                this.eks
                    .describeCluster({ name: eksCluster })
                    .promise()
                    .then((res) => res.cluster)
            ) || []
        );

        return clusterDescriptions
            .filter((clusterDescription) =>
                vpcIds.includes(clusterDescription?.resourcesVpcConfig?.vpcId!)
            )
            .map(
                (clusterDescription) =>
                    clusterDescription?.resourcesVpcConfig?.vpcId
            );
    };

    describeLambdas = (vpcIds: string[]) =>
        this.lambda
            .listFunctions()
            .promise()
            .then((res) => res.Functions)
            .then((lambdaFunctions) =>
                lambdaFunctions?.filter(
                    (lambdaFunction) =>
                        lambdaFunction.VpcConfig &&
                        vpcIds.includes(lambdaFunction.VpcConfig.VpcId!)
                )
            )
            .then((functions) => functions?.map((fn) => fn.FunctionName));

    describeRdss = (vpcIds: string[]) =>
        this.rds
            .describeDBInstances()
            .promise()
            .then((res) => res.DBInstances)
            .then((rdsInstances) =>
                rdsInstances?.filter((rds) =>
                    vpcIds.includes(rds.DBSubnetGroup?.VpcId!)
                )
            )
            .then((rdsInstances) =>
                rdsInstances?.map(
                    (rdsInstance) => rdsInstance.DBInstanceIdentifier
                )
            );

    describeElbs = (vpcIds: string[]) =>
        this.elb
            .describeLoadBalancers()
            .promise()
            .then((res) => res.LoadBalancerDescriptions)
            .then((elbs) => elbs?.filter((elb) => vpcIds.includes(elb.VPCId!)))
            .then((elbs) => elbs?.map((elb) => elb.LoadBalancerName));

    describeElbsV2 = (vpcIds: string[]) =>
        this.elbv2
            .describeLoadBalancers()
            .promise()
            .then((res) => res.LoadBalancers)
            .then((elbsv2) =>
                elbsv2?.filter((elbv2) => vpcIds.includes(elbv2.VpcId!))
            )
            .then((elbs) => elbs?.map((elb) => elb.LoadBalancerName));

    describeNats = (vpcIds: string[]) =>
        this.ec2
            .describeNatGateways({
                Filter: [{ Name: "vpc-id", Values: vpcIds }],
            })
            .promise()
            .then((res) => res.NatGateways)
            .then((natGateways) => natGateways?.map((ngw) => ngw.NatGatewayId));

    describeEnis = (vpcIds: string[]) =>
        this.ec2
            .describeNetworkInterfaces({
                Filters: [{ Name: "vpc-id", Values: vpcIds }],
            })
            .promise()
            .then((res) => res.NetworkInterfaces)
            .then((networkInterfaces) =>
                networkInterfaces?.map(
                    (networkInterface) => networkInterface.NetworkInterfaceId
                )
            );

    describeIgws = (vpcIds: string[]) =>
        this.ec2
            .describeInternetGateways({
                Filters: [{ Name: "attachment.vpc-id", Values: vpcIds }],
            })
            .promise()
            .then((res) => res.InternetGateways)
            .then((igws) => igws?.map((igw) => igw.InternetGatewayId));

    describeVpgws = (vpcIds: string[]) =>
        this.ec2
            .describeVpnGateways({
                Filters: [{ Name: "attachment.vpc-id", Values: vpcIds }],
            })
            .promise()
            .then((res) => res.VpnGateways)
            .then((vpngws) => vpngws?.map((vpngw) => vpngw.VpnGatewayId));

    describeSubnets = (vpcIds: string[]) =>
        this.ec2
            .describeSubnets({
                Filters: [{ Name: "vpc-id", Values: vpcIds }],
            })
            .promise()
            .then((res) => res.Subnets)
            .then((subnets) => subnets?.map((subnet) => subnet.SubnetId));

    describeAcls = (vpcIds: string[]) =>
        this.ec2
            .describeNetworkAcls({
                Filters: [{ Name: "vpc-id", Values: vpcIds }],
            })
            .promise()
            .then((res) => res.NetworkAcls)
            .then((networkAcls) =>
                networkAcls?.map((networkAcl) => networkAcl.NetworkAclId)
            );

    describeVpcEndpoints = (vpcIds: string[]) =>
        this.ec2
            .describeVpcEndpoints({
                Filters: [{ Name: "vpc-id", Values: vpcIds }],
            })
            .promise()
            .then((res) => res.VpcEndpoints)
            .then((vpcEndpoints) =>
                vpcEndpoints?.map((vpcEndpoint) => vpcEndpoint.VpcEndpointId)
            );

    getSGDependencies = async (
        sgId: string
    ): Promise<SGDependencyAttributes[]> => {
        const vpcIds = (await this.getVpcOfSg(sgId)) as string[];
        if (vpcIds.some((vpcId) => vpcId === undefined))
            return Promise.resolve([]);

        const [
            lambda,
            rds,
            asg,
            ec2,
            elb,
            elbv2,
            nat,
            igw,
            vpgw,
            eni,
            acl,
            subnet,
        ] = await Promise.all([
            this.describeLambdas(vpcIds),
            this.describeRdss(vpcIds),
            this.describeAsgs(vpcIds),
            this.describeEc2s(vpcIds),
            this.describeElbs(vpcIds),
            this.describeElbsV2(vpcIds),
            this.describeNats(vpcIds),
            this.describeIgws(vpcIds),
            this.describeVpgws(vpcIds),
            this.describeEnis(vpcIds),
            this.describeAcls(vpcIds),
            this.describeSubnets(vpcIds),
        ]);

        return [
            {
                dependencyName: "Lambda",
                dependencies: lambda,
                links: lambda?.map((name) =>
                    this.urlGenerator.lambda_url(name!)
                ),
            },
            {
                dependencyName: "Rds",
                dependencies: rds,
                links: rds?.map((name) => this.urlGenerator.rds_url(name!)),
            },
            {
                dependencyName: "ASG",
                dependencies: asg,
                links: asg?.map((name) => this.urlGenerator.asg_url(name!)),
            },
            {
                dependencyName: "EC2",
                dependencies: ec2,
                links: ec2?.map((name) => this.urlGenerator.ec2_url(name!)),
            },
            {
                dependencyName: "Elb",
                dependencies: elb,
                links: elb?.map((name) => this.urlGenerator.elb_url(name!)),
            },
            {
                dependencyName: "ElbV2",
                dependencies: elbv2,
                links: elbv2?.map((name) => this.urlGenerator.elb_url(name!)),
            },
            {
                dependencyName: "Nat",
                dependencies: nat,
                links: nat?.map((name) =>
                    this.urlGenerator.nat_gateway_url(name!)
                ),
            },
            {
                dependencyName: "IGW",
                dependencies: igw,
                links: igw?.map((name) => this.urlGenerator.igw_url(name!)),
            },
            {
                dependencyName: "VPGW",
                dependencies: vpgw,
                links: vpgw?.map((name) => this.urlGenerator.vpgw_url(name!)),
            },
            {
                dependencyName: "ENI",
                dependencies: eni,
                links: eni?.map((name) => this.urlGenerator.eni_url(name!)),
            },
            {
                dependencyName: "ACL",
                dependencies: acl,
                links: acl?.map((name) => this.urlGenerator.acl_url(name!)),
            },
            {
                dependencyName: "Subnet",
                dependencies: subnet,
                links: subnet?.map((name) =>
                    this.urlGenerator.subnet_url(name!)
                ),
            },
        ];
    };
}

export const useAWSHelper = (credentials: AWSCredentials) =>
    new AWSHelper(credentials);
