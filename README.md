# Failure injection for Google Cloud Functions - failure-cloudfunctions

## Description

`failure-cloudfunctions` is a small Node module for injecting failure into Google Cloud Functions (https://cloud.google.com/functions/). It offers a simple failure injection wrapper for your Cloud Functions handler where you then can choose to inject failure by setting the `failureMode` to `latency`, `exception`, `blacklist`, `diskspace` or `statuscode`. You control your failure injection using a secret in Secret Manager.

## How to install

1. Install `failure-cloudfunctions` module using NPM.
```bash
npm install failure-cloudfunctions
```
2. Add the module to your Cloud Functions function code.
```js
const failureCloudFunctions = require('failure-cloudfunctions')
```
3. Wrap your handler.
```js
exports.handler = failureCloudFunctions(async (req, res) => {
  ...
})
```
4. Create a secret in Secret Manager.
```json
{"isEnabled": false, "failureMode": "latency", "rate": 1, "minLatency": 100, "maxLatency": 400, "exceptionMsg": "Exception message!", "statusCode": 404, "diskSpace": 100, "blacklist": ["storage.googleapis.com"]}
```
```bash
gcloud beta secrets create <your-secret-name> --replication-policy="automatic"
echo -n "{\"isEnabled\": false, \"failureMode\": \"latency\", \"rate\": 1, \"minLatency\": 100, \"maxLatency\": 400, \"exceptionMsg\": \"Exception message!\", \"statusCode\": 404, \"diskSpace\": 100, \"blacklist\": [\"storage.googleapis.com\"]}" | gcloud beta secrets versions add <your-secret-name> --data-file=-
```
5. Add environment variables to your Cloud Function with values from above.
```bash
GCP_PROJECT=<your-gcp-project-id>
FAILURE_INJECTION_PARAM=<your-secret-name>
```
6. Give your Cloud Function access to your secret in Secret Manager.
```bash
gcloud beta secrets add-iam-policy-binding <your-secret-name> --role roles/secretmanager.secretAccessor --member serviceAccount:<your-gcp-project-id>@appspot.gserviceaccount.com
```
7. Try it out!

## Usage

Edit the values of your parameter in Secret Manager to use the failure injection module.

* `isEnabled: true` means that failure is injected into your Cloud Function.
* `isEnabled: false` means that the failure injection module is disabled and no failure is injected.
* `failureMode` selects which failure you want to inject. The options are `latency`, `exception`, `blacklist`, `diskspace` or `statuscode` as explained below.
* `rate` controls the rate of failure. 1 means that failure is injected on all invocations and 0.5 that failure is injected on about half of all invocations.
* `minLatency` and `maxLatency` is the span of latency in milliseconds injected into your function when `failureMode` is set to `latency`.
* `exceptionMsg` is the message thrown with the exception created when `failureMode` is set to `exception`.
* `statusCode` is the status code returned by your function when `failureMode` is set to `statuscode`.
* `diskSpace` is size in MB of the file created in tmp when `failureMode` is set to `diskspace`.
* `blacklist` is an array of regular expressions, if a connection is made to a host matching one of the regular expressions it will be blocked.

## Example

In the subfolder `example` is a simple function which can be installed in Google Cloud and used for test.

## Notes

Inspired by Yan Cui's articles on latency injection for Google Cloud Functions (https://hackernoon.com/chaos-engineering-and-aws-lambda-latency-injection-ddeb4ff8d983) and Adrian Hornsby's chaos injection library for Python (https://github.com/adhorn/aws-lambda-chaos-injection/).

## Changelog

### 2020-03-01 v0.2.0

* Fixed Secret Manager integration.
* Added simple example.
* Updated documentation.

### 2020-02-28 v0.0.1

* Initial release

## Contributors

**Gunnar Grosch** - [GitHub](https://github.com/gunnargrosch) | [Twitter](https://twitter.com/gunnargrosch) | [LinkedIn](https://www.linkedin.com/in/gunnargrosch/)

**Jason Barto** - [GitHub](https://github.com/jpbarto) | [Twitter](https://twitter.com/Jason_Barto) | [LinkedIn](https://www.linkedin.com/in/jasonbarto)
