# Flatten the curve

This is a work-in-progress covid-19 dashboard.

## To get started with development:

```
npm run build 
npm run express
npm run webpack-dev-server
```
webpack dev server will run on :3000 and proxy all requests to api/** to :8080

## Or with docker:
```
npm run build
docker build . -t the-curve
docker run -p 8080:8080 the-curve
```
