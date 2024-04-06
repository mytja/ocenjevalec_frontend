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

    let submission: any = null;

    let snackbar: (data: SnackbarIn) => void;

    let numberExtraOptions: HTMLInputAttributes = {type: "number"};

    async function getSubmission() {
        let response: Response;
        try {
            response = await fetch(`${baseurl}/submission/${params.submissionId}`, {method: "GET", credentials: production ? undefined : "include"});
        } catch (e) {
            snackbar({ message: "Napaka pri izvajanju zahtevka!", closable: true });
            return;
        }
        if (response.status !== 200) {
            snackbar({ message: "Napaka pri pridobivanju oddaje!", closable: true });
            return;
        }
        submission = (await response.json()).data;
    }

    async function deleteSubmission() {
        let response: Response;
        try {
            response = await fetch(`${baseurl}/submission/${params.submissionId}`, {method: "DELETE", credentials: production ? undefined : "include"});
        } catch (e) {
            snackbar({ message: "Napaka pri izvajanju zahtevka!", closable: true });
            return;
        }
        if (response.status !== 200) {
            snackbar({ message: "Napaka pri brisanju oddaje!", closable: true });
            return;
        }
        await push(`/tekmovanje/${submission.CompetitionID}`)
    }

    async function updateSubmission() {
        let fd = new FormData();
        fd.append("score", submission.Score.toString());

        let response: Response;
        try {
            response = await fetch(`${baseurl}/submission/${params.submissionId}`, {method: "PATCH", body: fd, credentials: production ? undefined : "include"});
        } catch (e) {
            snackbar({ message: "Napaka pri izvajanju zahtevka!", closable: true });
            return;
        }
        if (response.status !== 200) {
            snackbar({ message: "Napaka pri posodabljanju rezultata!", closable: true });
            return;
        }
        await getSubmission();
    }

    export let params = {
        submissionId: undefined,
    }

    getSubmission();
</script>

<h2>Oddaja</h2>

{#if submission !== null}
    Enolični identifikator oddaje: <b>{submission.ID}</b> <br>
    Enolični identifikator ekipe: <b>{submission.TeamID}</b> <br>
    Enolični identifikator problema: <b>{submission.ProblemID}</b> <br>
    Enolični identifikator tekmovanja: <b>{submission.CompetitionID}</b>

    <p/>

    <h2>Evaluacija</h2>
    Rezultat: <b>{submission.Verdict}</b> <br>
    Oddano po: <b>{submission.SubmittedAfter}</b> <br>
    Evaluirano: <b>{submission.Solution}</b> <p/>

    <div class="full-width">
    <TextField extraOptions={numberExtraOptions} bind:value={submission.Score} name="Število točk"></TextField>
    </div><p/>

    Komentar sodniškega sistema: <br>
    <code style="white-space: pre-wrap;">
        {submission.SubmissionLog}
    </code>

    <p/>

    <Button type="filled" on:click={updateSubmission}>Posodobi oddajo</Button>

    <Button type="outlined" on:click={deleteSubmission}>Izbriši oddajo</Button>
{/if}

<SnackbarAnim bind:show={snackbar} />
