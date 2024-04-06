// @ts-ignore
export const production: boolean = import.meta.env.PROD;
export let baseurl: string = (!production ? "http://127.0.0.1:8000" : "/api");
