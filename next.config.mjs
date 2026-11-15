// Separate acceptance builds from the running private service.
const config = { distDir: process.env.NEXT_DIST_DIR || '.next' };
export default config;
