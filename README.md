# Reto1InternshipCloud.Cloud

This repository contains the Cloudformation templates and a CDK app for the cloud resources needed for a ToDo Webapp. The resources are separeated in three layers (Frontend, Backend and Data). The main branch has the Cloudformation templates, that are deployed using nested stacks, and the CDK branch, the CDK app.

The frontend has a Cloudfront for the distribution and S3 bucket for the webpage itself. The backend consists in 4 lambdas for each HTTP method (GET, POST, PUT & DELETE) and a API Gateway to redirect to the corresponding Lambda. The data layer has a DynamoDB table to save all information of a ToDo item (ID, title, description & status).

All resources and deployments are made through a pipeline from Azure DevOps. The corresponing pipelines files for the two ways of creating the resources are in each branch. For the Cloudformation template, a bucket for the templates is created and the nested stacks files are uploaded afterwards. The functions for the lambdas are also obtained through a S3 bucket. The deployment of the files for the frontend and for the backend (Lambda funcitons) are independant for each other and from the deployment of the cloud resources but these last two are not in this repository but in the repository containing the code itself.
