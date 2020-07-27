# NP-Robotics Client.
A serverless hosted website for management of deployed robots remotely built on AWS.

Hosted on [AWS S3 Bucket.](https://d288rhytyi5vkv.cloudfront.net/)

## Front-End Stacks:
- **React Hooks**
- **Yarn** for package management. **DO NOT USE NPM.**
- **UmiJS** for page management and routing.
- **DvaJS** for global state management.
- **ESLint** for linting.

## Deployment Stacks
- **AWS S3** for hosting.
- **Github Actions** for building and deploying to S3 bucket upon merge with master.

## To Contribute
Hello future developers. When I am gone you will probably be working on this.

Go study React and React Hooks. Watch some youtube videos on it.

Im sorry but documentation on UmiJS and DvaJS is entirely in chinese and there are no youtube videos to teach you how to work with that. Closest there is to working with state management packages like DvaJS is Redux Sagas. So check that out. After that, maybe google translate the DvaJS documentation and read through the [Model Docs](https://dvajs.com/api/#model) for Dva. It explains it pretty well.

[UmiJS](https://umijs.org/) documentation is pretty decent even after google translating the pages. It's also pretty simple.

If you can survive and actually contribute to the repo following the code structure and good practices with no prior knowledge of web development, you're a legend. I will treat you to a meal.

## Development Good Practices
Do your development in your personal branches. Merge with master on the end of your sprint or at the end of the week. Saves money and prevents bugs from being deployed.

Write Unit Tests (if possible. I'm sorry I have never written unit tests for web development before.)

Modularize and follow the standards provided by DvaJS. Call your API's in your model Side Effects, and only affect the state using Reducers. Never affect state directly.

**DO NOT REMOVE LINTING ERRORS!** They are there to ensure your code does not behave unexpectedly! Fix the errors given when commiting.

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
