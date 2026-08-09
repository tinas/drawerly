// Bundlers replace `process.env.NODE_ENV` at build time, which is what keeps
// development-only warnings out of production bundles.
declare const process: { env: { NODE_ENV?: string } }
