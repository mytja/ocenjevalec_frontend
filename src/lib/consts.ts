// @ts-ignore
export const production: boolean = "isProduction" === "true";
export let baseurl: string = (!production ? "http://127.0.0.1:8000" : "/api");
