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
</script>

<h2>Nova oddaja</h2>

<div class="full-width">
    <TextField bind:value={submission} name="Oddaja"></TextField>
</div>

<p/>

Problem:

<p/>

<SegmentedButtonContainer>
    {#each problems as p, i}
        <input type="radio" on:click={async () => {
                problemId = p.ID;
            }} name="segmented-b-1" id="segmented-b-1-{i}" checked={problemId === p.ID} />
        <SegmentedButtonItem input="segmented-b-1-{i}">{p.Name.replace("Problem", "Prob.")}</SegmentedButtonItem>
    {/each}
</SegmentedButtonContainer>

<p/>

Ekipa:

<p/>

<SegmentedButtonContainer>
    {#each teams as t, i}
        <input type="radio" on:click={async () => {
                teamId = t.ID;
            }} name="segmented-b-2" id="segmented-b-2-{i}" checked={teamId === t.ID} />
        <SegmentedButtonItem input="segmented-b-2-{i}">{t.Name}</SegmentedButtonItem>
    {/each}
</SegmentedButtonContainer>

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
