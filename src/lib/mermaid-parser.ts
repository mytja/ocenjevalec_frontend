import mermaid from "mermaid";

let code = "";

async function parseMermaid(sol: String, tag: String) {
    console.log("mmaid", tag)
    let nsol = sol.toUpperCase().replaceAll(" ", "");
    code = "flowchart LR\n";
    try {
        let p = parse(nsol);
        code += `${p.hash}[${p.funkcija}] --> izhod[IZHOD]\n`;
    } catch (e) {
        console.log(e);
        code = "";
    }
    console.log("Rendering!", code)
    try {
        const {svg} = await mermaid.render(`mermaid-d${tag}info`, code);
        document.getElementById(`mermaid-d${tag}`).innerHTML = svg;
        console.log("Done rendering!");
    } catch (e) {
        // hacky način za renderanje errorja
        console.log("Renderam error!", e)
        let target = document.getElementById(`mermaid-d${tag}info`);
        document.getElementById(`mermaid-outer${tag}`).appendChild(target);
        console.log("Error rendering končan!")
    }
}

class RetResult {
    full: string;
    funkcija: string;
    hash: string;

    constructor(full: string) {
        this.full = full;
        const re = /((?:AND)|(?:OR)|(?:XOR)|(?:XNOR)|(?:NOR)|(?:NAND)|(?:NOT))\((.*)\)/;
        let m = full.match(re);
        if (m === null || m.length <= 1) {
            this.funkcija = full;
        } else {
            this.funkcija = m[1];
        }
        this.hash = this.full.hashCode();
    }
}

function parse(nsol: string): RetResult {
    // let nsol = solution.toUpperCase().replaceAll(" ", "");
    const re = /((?:AND)|(?:OR)|(?:XOR)|(?:XNOR)|(?:NOR)|(?:NAND)|(?:NOT))\((.*)\)/;
    let m = nsol.match(re);
    if (m === null) {
        console.log("m je null");
        return new RetResult(nsol);
    }
    let funkcija: string = m[1];
    let p: string = m[2];
    let n = 0;
    let parametri: string[] = ["", ""];
    for (let i = 0; i < p.length; i++) {
        if (p.charAt(i) === "(") n++;
        if (p.charAt(i) === ")") n--;
        if (n == 0 && p.charAt(i) === ",") {
            parametri[0] = p.substring(0, i);
            parametri[1] = p.substring(i + 1, p.length);
        }
    }
    if (parametri[0] === "") parametri[0] = p;

    console.log(m, parametri, funkcija);
    if (parametri[0] === undefined) return new RetResult(nsol);
    let n1 = parse(parametri[0]);
    console.log(n1);
    code += `${n1.hash}[${n1.funkcija}] --> ${nsol.hashCode()}[${funkcija}]\n`;
    if (funkcija === "NOT") {
        return new RetResult(nsol);
    }
    if (parametri[1] === undefined) {
        throw Error("Premalo vrednosti!");
    }
    let n2 = parse(parametri[1]);
    code += `${n2.hash}[${n2.funkcija}] --> ${nsol.hashCode()}[${funkcija}]\n`;
    return new RetResult(nsol);
}

export {parseMermaid};
