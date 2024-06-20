<script lang="ts">
    import {
        Button,
        SegmentedButtonContainer,
        SegmentedButtonItem,
        SnackbarAnim,
        type SnackbarIn,
        TextField
    } from "m3-svelte";
    import {push} from 'svelte-spa-router'
    import {baseurl, production} from "../lib/consts";
    import type {HTMLInputAttributes} from "svelte/elements";
    import {onMount} from "svelte";
    import mermaid from "mermaid";
    import {parseMermaid} from "../lib/mermaid-parser";

    let submission = "";
    let disabled = true;

    let snackbar: (data: SnackbarIn) => void;
    let tcs: any;

    let problems: any[] = [];
    let problemId = "";
    let teamId = "";
    let prevSubId = "";
    let submittedAfter = 0;
    let teams: any[] = [];

    let numberExtraOptions: HTMLInputAttributes = {type: "number"};

    onMount(() => {
        mermaid.initialize({startOnLoad: false});
    })

    async function testiraj() {
        let fd = new FormData();
        fd.append("submission", submission);
        fd.append("submitted_after", submittedAfter.toString());
        fd.append("previous_submission_id", prevSubId);
        fd.append("team_id", teamId);

        let response: Response;
        try {
            response = await fetch(`${baseurl}/problem/${problemId}/submission`, {method: "POST", body: fd, credentials: production ? undefined : "include"});
        } catch (e) {
            snackbar({ message: "Napaka pri izvajanju zahtevka!", closable: true });
            return;
        }
        if (response.status !== 201) {
            snackbar({ message: "Napaka pri izvajanju testiranja na strežniku!", closable: true });
            return;
        }
        tcs = (await response.json()).data;
        prevSubId = tcs.ID;
        disabled = false;
    }

    async function getProblems() {
        let response: Response;
        try {
            response = await fetch(`${baseurl}/competition/${params.competitionId}/problems`, {method: "GET", credentials: production ? undefined : "include"});
        } catch (e) {
            snackbar({ message: "Napaka pri izvajanju zahtevka!", closable: true });
            return;
        }
        if (response.status !== 200) {
            snackbar({ message: "Napaka pri pridobivanju problemov!", closable: true });
            return;
        }
        problems = (await response.json()).data;
    }

    async function getTeams() {
        let response: Response;
        try {
            response = await fetch(`${baseurl}/competition/${params.competitionId}/teams`, {method: "GET", credentials: production ? undefined : "include"});
        } catch (e) {
            snackbar({ message: "Napaka pri izvajanju zahtevka!", closable: true });
            return;
        }
        if (response.status !== 200) {
            snackbar({ message: "Napaka pri pridobivanju ekip!", closable: true });
            return;
        }
        teams = (await response.json()).data;
    }

    async function oddaj() {
        let fd = new FormData();
        fd.append("public", "true");

        let response: Response;
        try {
            response = await fetch(`${baseurl}/submission/${prevSubId}`, {method: "PATCH", body: fd, credentials: production ? undefined : "include"});
        } catch (e) {
            snackbar({ message: "Napaka pri izvajanju zahtevka!", closable: true });
            return;
        }
        if (response.status !== 200) {
            snackbar({ message: "Napaka pri objavljanju rezultata!", closable: true });
            return;
        }
        await push(`/tekmovanje/${params.competitionId}`)
    }

    export let params = {
        competitionId: undefined,
    }

    getProblems();
    getTeams();

    $: parseMermaid(submission, "");
</script>

<h2>Nova oddaja</h2>

<div class="full-width">
    <TextField bind:value={submission} name="Oddaja"></TextField>
</div>

<p/>

<h4>Lokalna evaluacija sintaktične pravilnosti</h4>

<small>Lokalna evaluacija ni obvezujoča, niti ni garantirano, da bo dala pravilen izhod za rešitev. Vse rešitve se testirajo na strežniku s pravilnim evaluatorjem (ki ni napisan v JavaScriptu). Strežnik je navadno bolj strog in ne bo pustil drugih sintaktičnih napak, ki so dovoljene v JavaScript implementaciji.</small>

<p/>

<div id="mermaid-outer" style="text-align: center;">
    <div id="mermaid-dinfo"></div>
    <div id="mermaid-d"></div>
</div>

<p/>

Problem:

<p/>

{#if problems !== undefined && problems !== null}
    {#each {length: Math.ceil(problems.length / 10)} as _, i}
        <SegmentedButtonContainer>
            {#each {length: (i + 1) * 10 <= problems.length ? 10 : problems.length - (i * 10)} as _, l}
                {@const p = problems[i * 10 + l]}
                <input type="radio" on:click={async () => {
                        problemId = p.ID;
                    }} name="segmented-b-p{i}" id="segmented-b-p{i}-{l}" checked={problemId === p.ID} />
                <SegmentedButtonItem input="segmented-b-p{i}-{l}">{p.Name.replace("Problem", "Prob.")}</SegmentedButtonItem>
            {/each}
        </SegmentedButtonContainer>
        <br>
    {/each}
{/if}

<p/>

Ekipa:

<p/>

{#if teams !== undefined && teams !== null}
    <SegmentedButtonContainer>
        {#each teams as t, i}
            <input type="radio" on:click={async () => {
                    teamId = t.ID;
                }} name="segmented-b-2" id="segmented-b-2-{i}" checked={teamId === t.ID} />
            <SegmentedButtonItem input="segmented-b-2-{i}">{t.Name}</SegmentedButtonItem>
        {/each}
    </SegmentedButtonContainer>
{/if}

<p/>

<div class="full-width">
    <TextField extraOptions={numberExtraOptions} bind:value={submittedAfter} name="Oddano po"></TextField>
</div>

<p/>

<Button type="filled" on:click={testiraj}>Evaluiraj pravilnost oddaje</Button>

<p/>

{#if !disabled}
    <h3>Rezultati evaluacije</h3>
    Rezultat: <b>{tcs.Verdict}</b> <br>
    Evaluirano: <b>{tcs.Solution}</b> <br>
    Točk: <b>{tcs.Score}</b> <p/>

    Komentar sodniškega sistema: <br>
    <code style="white-space: pre-wrap;">
        {tcs.SubmissionLog}
    </code>

    <p/>
{/if}

<Button type="filled" disabled={disabled} on:click={oddaj}>Oddaj</Button>

<SnackbarAnim bind:show={snackbar} />
