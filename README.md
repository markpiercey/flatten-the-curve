# Flatten the curve

This is a work-in-progress, canada-centric covid-19 dashboard.

## Developer Enviroment Setup:

### Windows Install
1. Install Node JS [12.16.1 LTS](https://nodejs.org/en/)

### Mac
*Fill me out please*

### Linux 
*Fill me out please*

## First Time Running Servers 
```shell
npm install
npm run build 

# Run the Express Server (Blocking)
npm run express

# Run the Webpack dev server (Blocking)
npm run webpack-dev-server
```

webpack dev server will run on :3000 and proxy all requests to api/** to :8080

## Or with docker:
```
npm run build
docker build . -t the-curve
docker run -p 8080:8080 the-curve
```
