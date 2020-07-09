# NP-Robotics Client.
A serverless hosted website for management of deployed robots remotely built on AWS.

Hosted on [AWS S3 Bucket.](http://nprobotics-client-remote.s3-website-us-east-1.amazonaws.com/)

## Front-End Stacks:
- **React Hooks**
- **Yarn** for package management. **DO NOT USE NPM.**
- **UmiJS** for page management and routing.
- **DvaJS** for global state management.
- **ESLint** for linting.

## Deployment Stacks
- **AWS S3** for hosting.
- **Github Actions** for building and deploying to S3 bucket upon merge with master.

# Setup
Git clone the repo.
```
git clone https://github.com/NP-Robotics/nprobotics-client-remote.git
```
Install [Nodejs v12.](https://nodejs.org/en/)

Install Yarn.
```
npm install -g yarn
```
Enter the repo.
```
cd nprobotics-client-remote
```
Install dependencies.
```
yarn
```
Done!

# Running
To start a local server.
```
yarn start
```
Done!
