# Reto1InternshipCloud.Cloud

This repository contains the Cloudformation templates and a CDK app for the resources needed for a ToDo Webapp. The resources are separeated in three layers (Frontend, Backend and Data). The main branch has the Cloudformation templates and the CDK branch, the CDK app.

The frontend has a Cloudfront for the distribution and S3 bucket for the webpage itself. The backend consists in 4 lambdas for each HTTP method (GET, POST, PUT & DELETE) and a API Gateway to redirect to the corresponding Lambda. The data layer has a DynamoDB table to save all information of a ToDo item (ID, title, description & status).
