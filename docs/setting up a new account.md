# Setting up for a new organisation
Hi friends, today I am going to teach you how to setup a new account for any organisation.

The steps are as follows
- Create an SGRobotCloud account
- Create an AWS IOT Policy for the organisation
- Create an AWS IOT Thing for the robot to be added
- Create a new entry in the robot DynamoDB for the new robot
- Attaching AWS IOT Policy to the SGRobotCloud account

In the future, hopefully this workflow can be automated. But as of right now we just got to do this manually :(

## Creating an account
First, create an account here,[SGRobotCloud.](https://sgrobotcloud.com/#/signup)

Enter the fields as required. When you are entering the organisation name, decide on an organisation code. 
This code you enter in the form will be used as a reference to grab robot information from the database. Enter everything in __CAPITALS__. Here are some 
short and simple organisation codes that are currently in use for reference
- __PRU__ - Prudential
- __NPR__ - NParks
- __NP__ - Ngee Ann

After creating your account, verify your email by clicking the link that was sent to you. Then, log in to your account. 

## Creating an IOT Core Policy
Now, it is time for you to create an IOT Core Policy. Log into the Ngee Ann AWS account. 
Select your region in the top right hand corner. Choose Singapore, AKA ap-southeast-1. Now, 
find the AWS IOT Core resource inside the AWS console. 

On the left sider, click: `Secure -> Policies -> Create`.

Name your policy as `[organisation code]-policy`. Ensure naming convention as `kebab-case`. For example:

- __pru-policy__
- __npr-policy__
- __np-policy__

Leave all other fields blank, click `Advanced Mode`, and paste the following policy in. The policy shown below is for the __PRU__
organisation code. Change all the points containing __PRU__ to your organisational code. Ensure your organisational code is in __CAPITALS__.
Once you are done, click Create.
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iot:Publish",
        "iot:Receive",
        "iot:Subscribe"
      ],
      "Resource": [
        "arn:aws:iot:ap-southeast-1:791415850326:topic/PRU/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Subscribe"
      ],
      "Resource": [
        "arn:aws:iot:ap-southeast-1:791415850326:topicfilter/PRU/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Connect"
      ],
      "Resource": [
        "*"
      ]
    }
  ]
}
```
## Creating an IOT Core Thing
Now, it is time for you to create an IOT Core Thing. On the left taskbar, click: `Manage -> Things -> Create -> Create a Single Thing`. Ensure naming convention as `kebab-case`. 
The names created are only for backend usage. 

Once done, click: `Next -> Create Thing without Certificate`.

You have now created an IOT Core Thing.

## Adding a robot entry to DynamoDB
Now, in your AWS console, change your region to us-east-1, or North Virginia. Next, find your way over to the DynamoDB resource in the console.
On the left bar in the page, click `Tables -> robot-db -> Items`. Select the checkbox of any one of the items, 
then proceed to the top of the table and click `Actions -> Duplicate`.

Now, you should be presented with a box where you can edit some values. Follow the table below to figure out what values to edit.

| Key to change       | What to put inside|
| ------------- |:-------------:| 
| clientId     | Enter your AWS IOT thing name | 
| meetingName      | Enter your IOT thing name followed by `meeting`. e.g `eudora-meeting`.|   
| organisation | Enter your organisation code in __CAPITALS__.      |
| policyName | Enter your policy name e.g `pru-policy`.     |
| robotID | Enter the next biggest number out of all robotIDs in the table    |
| robotName | Enter the name of the robot to be displayed on the website.       |
| rosbridgeUrl | Enter the URL of your rosbridge websocket e.g `ws://localhost:9090`.    |

## Attaching IOT Policy to Cognito Account
TODO: THIS PART
