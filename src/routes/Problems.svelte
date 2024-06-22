<script lang="ts">
    import {Button, SnackbarAnim, type SnackbarIn, TextField, Switch} from "m3-svelte";
    import {push} from 'svelte-spa-router'
    import {baseurl, production} from "../lib/consts";
    import type {HTMLInputAttributes} from "svelte/elements";
    import {onMount} from "svelte";
    import mermaid from "mermaid";
    import {parseMermaid} from "../lib/mermaid-parser";

    let name = "";
    let snackbar: (data: SnackbarIn) => void;

    let problems: any[] = [];

    let numberExtraOptions: HTMLInputAttributes = {type: "number"};

    let solution = "";
    let points = 1000;
    let baseOnly = false;

    onMount(() => {
        mermaid.initialize({startOnLoad: false});
    })

    async function fetchProblems() {
        let response: Response;
        try {
            response = await fetch(`${baseurl}/competition/${params.competitionId}/problems`, {method: "GET", credentials: production ? undefined : "include"});
        } catch (e) {
            await push("/prijava")
            return;
        }
        if (response.status !== 200) {
            await push("/prijava")
            return;
        }
        problems = (await response.json()).data;

        if (problems === undefined || problems === null) return;

        for (let i = 0; i < problems.length; i++) {
            let c = problems[i];
            if (c === undefined || c.ID === undefined) continue;
            setTimeout(() => parseMermaid(c.Solution, c.ID), 100);
        }
    }

    async function newProblem() {
        let fd = new FormData();
        fd.append("name", name);
        fd.append("points", points.toString());
        fd.append("solution", solution);
        fd.append("is_base_logic_only", baseOnly.toString());

        let response: Response;
        try {
            response = await fetch(`${baseurl}/competition/${params.competitionId}/problems`, {method: "POST", body: fd, credentials: production ? undefined : "include"});
        } catch (e) {
            snackbar({ message: "Napaka pri izvajanju zahtevka!", closable: true });
            return;
        }
        if (response.status !== 201) {
            snackbar({ message: "Napaka pri ustvarjanju novega problema!", closable: true });
            return;
        }
        await fetchProblems();
    }

    async function deleteProblem(id: string) {
        let response: Response;
        try {
            response = await fetch(`${baseurl}/problem/${id}`, {method: "DELETE", credentials: production ? undefined : "include"});
        } catch (e) {
            snackbar({ message: "Napaka pri izvajanju zahtevka!", closable: true });
            return;
        }
        if (response.status !== 200) {
            snackbar({ message: "Napaka pri brisanju problema!", closable: true });
            return;
        }
        await fetchProblems();
    }

    async function updateProblem(id: string, name: string, points: number, solution: string, position: number, baseOnly: boolean) {
        let fd = new FormData();
        fd.append("name", name);
        fd.append("points", points.toString());
        fd.append("solution", solution);
        fd.append("position", position.toString());
        fd.append("is_base_logic_only", baseOnly.toString());

        let response: Response;
        try {
            response = await fetch(`${baseurl}/problem/${id}`, {method: "PATCH", body: fd, credentials: production ? undefined : "include"});
        } catch (e) {
            snackbar({ message: "Napaka pri izvajanju zahtevka!", closable: true });
            return;
        }
        if (response.status !== 200) {
            snackbar({ message: "Napaka pri urejanju problema!", closable: true });
            return;
        }
        await fetchProblems();
    }

    export let params = {
        competitionId: undefined,
    }

    fetchProblems();

    $: parseMermaid(solution, "");
</script>

<h2>Nov problem</h2>

<div class="full-width">
    <TextField bind:value={name} name="Ime problema"></TextField>
</div>

<p/>

<div class="full-width">
    <TextField extraOptions={numberExtraOptions} bind:value={points} name="Točk za problem"></TextField>
</div>

<p/>

<div class="full-width">
    <TextField bind:value={solution} name="Rešitev"></TextField>
</div>

<p/>

<label for={undefined}>
    <Switch bind:checked={baseOnly} />
    Dovoli samo osnovna logična vrata (AND, OR, NOT)
</label>

<p/>

<Button type="filled" on:click={newProblem}>Ustvari nov problem</Button>

<p/>

<div id="mermaid-outer" style="text-align: center;">
    <div id="mermaid-dinfo"></div>
    <div id="mermaid-d"></div>
</div>

<h2>Trenutni problemi</h2>

{#if problems === null || problems.length === 0}
    <i>Ničesar (še) ni tukaj :(</i>
{:else}
    {#each problems as c}
        <details>
            <summary>{c.Name}</summary>
            <h1>{c.Name}</h1>
            <br>
            <div class="full-width">
                <TextField bind:value={c.Name} name="Ime problema"></TextField>
            </div>
            <div class="full-width">
                <TextField bind:value={c.Solution} name="Rešitev problema"></TextField>
            </div>
            Arduino koda:
            <p/>
            <code>
                bool logic = {c.Solution};
            </code>
            <div id="mermaid-outer{c.ID}" style="text-align: center;">
                <div id="mermaid-d{c.ID}info"></div>
                <div id="mermaid-d{c.ID}"></div>
            </div>
            <div class="full-width">
                <TextField extraOptions={numberExtraOptions} bind:value={c.Position} name="Položaj"></TextField>
            </div>
            <div class="full-width">
                <TextField extraOptions={numberExtraOptions} bind:value={c.Points} name="Točke"></TextField>
            </div>
            <p/>
            <label for={undefined}>
                <Switch bind:checked={c.IsBaseLogicOnly} />
                Dovoli samo osnovna logična vrata (AND, OR, NOT)
            </label>
            <p/>
            <Button type="filled" on:click={() => updateProblem(c.ID, c.Name, c.Points, c.Solution, c.Position, c.IsBaseLogicOnly)}>Posodobi problem</Button>
            <Button type="outlined" on:click={() => deleteProblem(c.ID)}>Izbriši problem</Button>
        </details>
        <p/>
    {/each}
{/if}

<SnackbarAnim bind:show={snackbar} />
