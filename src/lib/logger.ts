// TODO: this needs to work on both server and client. can't use a tanstack isomorphic function because they seem to not work in the messaging callback in /api/sse
// name should be derived from import.meta.url relative to the project root prior to bundling
// client messages should be forwarded to an api endpoint
// will need to get config everywhere - a json file with a schema is probably fine
