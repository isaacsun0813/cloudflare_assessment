				import worker, * as OTHER_EXPORTS from "/Users/Isaac/Documents/GitHub/cloudflare_assessment_isaacsun/cloudflare_assessment/src/index.js";
				import * as __MIDDLEWARE_0__ from "/Users/Isaac/.nvm/versions/node/v21.1.0/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts";
				const envWrappers = [__MIDDLEWARE_0__.wrap].filter(Boolean);
				const facade = {
					...worker,
					envWrappers,
					middleware: [
						__MIDDLEWARE_0__.default,
            ...(worker.middleware ? worker.middleware : []),
					].filter(Boolean)
				}
				export * from "/Users/Isaac/Documents/GitHub/cloudflare_assessment_isaacsun/cloudflare_assessment/src/index.js";

				const maskDurableObjectDefinition = (cls) =>
					class extends cls {
						constructor(state, env) {
							let wrappedEnv = env
							for (const wrapFn of envWrappers) {
								wrappedEnv = wrapFn(wrappedEnv)
							}
							super(state, wrappedEnv);
						}
					};
				

				export default facade;