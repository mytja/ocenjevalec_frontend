<script lang="ts">
    import {Button, Icon, SnackbarAnim, type SnackbarIn, TextField} from "m3-svelte";
    import {push} from 'svelte-spa-router'
    import {baseurl, production} from "../lib/consts";
    import iconDelete from "@ktibow/iconset-material-symbols/delete";
    import iconCheck from "@ktibow/iconset-material-symbols/check";
    import type {HTMLInputAttributes} from "svelte/elements";

    let name = "";
    let snackbar: (data: SnackbarIn) => void;

    let problems: any[] = [];

    let numberExtraOptions: HTMLInputAttributes = {type: "number"};

    let solution = "";
    let points = 1000;

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
    }

    async function newProblem() {
        let fd = new FormData();
        fd.append("name", name);
        fd.append("points", points.toString());
        fd.append("solution", solution);

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

    async function updateProblem(id: string, name: string, points: number, solution: string, position: number) {
        let fd = new FormData();
        fd.append("name", name);
        fd.append("points", points.toString());
        fd.append("solution", solution);
        fd.append("position", position.toString());

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
    <TextField bind:value={solution} name="Solution"></TextField>
</div>

<p/>

<Button type="filled" on:click={newProblem}>Ustvari nov problem</Button>

<h2>Trenutni problemi</h2>

{#if problems.length === 0}
    <i>Ničesar (še) ni tukaj :(</i>
{:else}
    <table>
        <thead>
        <tr>
            <th scope="col">Problem</th>
            <th scope="col">Rešitev</th>
            <th scope="col">Položaj</th>
            <th scope="col">Točke</th>
            <th scope="col">Shrani spremembe</th>
            <th scope="col">Izbriši</th>
        </tr>
        </thead>
        <tbody>
        {#each problems as c}
            <tr>
                <th scope="row">
                    <div class="full-width">
                        <TextField bind:value={c.Name} name="Ime problema"></TextField>
                    </div>
                </th>
                <th scope="row">
                    <div class="full-width">
                        <TextField bind:value={c.Solution} name="Rešitev problema"></TextField>
                    </div>
                </th>
                <th scope="row">
                    <div class="full-width">
                        <TextField extraOptions={numberExtraOptions} bind:value={c.Position} name="Položaj"></TextField>
                    </div>
                </th>
                <th scope="row">
                    <div class="full-width">
                        <TextField extraOptions={numberExtraOptions} bind:value={c.Points} name="Točke"></TextField>
                    </div>
                </th>
                <td>
                    <Button on:click={() => updateProblem(c.ID, c.Name, c.Points, c.Solution, c.Position)} type="elevated" iconType="full">
                        <Icon icon={iconCheck} />
                    </Button>
                </td>
                <td>
                    <Button on:click={() => deleteProblem(c.ID)} type="elevated" iconType="full">
                        <Icon icon={iconDelete} />
                    </Button>
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
{/if}

<SnackbarAnim bind:show={snackbar} />
