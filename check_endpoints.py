import os
import boto3
from dotenv import load_dotenv

load_dotenv('cloud/.env')

region = os.getenv('AWS_REGION', 'us-east-1')
ak = os.getenv('AWS_ACCESS_KEY_ID')
sk = os.getenv('AWS_SECRET_ACCESS_KEY')

client = boto3.client(
    'sagemaker',
    region_name=region,
    aws_access_key_id=ak,
    aws_secret_access_key=sk
)

response = client.list_endpoints(SortBy='CreationTime', SortOrder='Descending')
endpoints = response['Endpoints']

if not endpoints:
    print("No endpoints found.")
else:
    print(f"{'Endpoint Name':<30} | {'Status':<15}")
    print("-" * 50)
    for e in endpoints:
        print(f"{e['EndpointName']:<30} | {e['EndpointStatus']:<15}")
