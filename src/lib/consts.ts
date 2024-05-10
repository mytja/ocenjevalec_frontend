// @ts-ignore
export const production: boolean = import.meta.env.PROD;
export let baseurl: string = (!production ? "http://127.0.0.1:8000" : "https://ocenjevalec.beziapp.si/api");

String.prototype.hashCode = function() {
    let hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
