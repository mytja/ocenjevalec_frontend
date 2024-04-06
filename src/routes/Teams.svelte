<script lang="ts">
    import {Button, Icon, SnackbarAnim, type SnackbarIn, TextField} from "m3-svelte";
    import {push} from 'svelte-spa-router'
    import {baseurl, production} from "../lib/consts";
    import iconDelete from "@ktibow/iconset-material-symbols/delete";
    import iconCheck from "@ktibow/iconset-material-symbols/check";

    let name = "";
    let snackbar: (data: SnackbarIn) => void;

    let teams: any[] = [];

    async function fetchTeams() {
        let response: Response;
        try {
            response = await fetch(`${baseurl}/competition/${params.competitionId}/teams`, {method: "GET", credentials: production ? undefined : "include"});
        } catch (e) {
            await push("/prijava")
            return;
        }
        if (response.status !== 200) {
            await push("/prijava")
            return;
        }
        teams = (await response.json()).data;
    }

    async function newTeam() {
        let fd = new FormData();
        fd.append("name", name);

        let response: Response;
        try {
            response = await fetch(`${baseurl}/competition/${params.competitionId}/teams`, {method: "POST", body: fd, credentials: production ? undefined : "include"});
        } catch (e) {
            snackbar({ message: "Napaka pri izvajanju zahtevka!", closable: true });
            return;
        }
        if (response.status !== 201) {
            snackbar({ message: "Napaka pri ustvarjanju nove ekipe!", closable: true });
            return;
        }
        await fetchTeams();
    }

    async function deleteTeam(id: string) {
        let response: Response;
        try {
            response = await fetch(`${baseurl}/team/${id}`, {method: "DELETE", credentials: production ? undefined : "include"});
        } catch (e) {
            snackbar({ message: "Napaka pri izvajanju zahtevka!", closable: true });
            return;
        }
        if (response.status !== 200) {
            snackbar({ message: "Napaka pri brisanju ekipe!", closable: true });
            return;
        }
        await fetchTeams();
    }

    async function changeTeamName(id: string, name: string) {
        let fd = new FormData();
        fd.append("name", name);

        let response: Response;
        try {
            response = await fetch(`${baseurl}/team/${id}`, {method: "PATCH", body: fd, credentials: production ? undefined : "include"});
        } catch (e) {
            snackbar({ message: "Napaka pri izvajanju zahtevka!", closable: true });
            return;
        }
        if (response.status !== 200) {
            snackbar({ message: "Napaka pri urejanju ekipe!", closable: true });
            return;
        }
        await fetchTeams();
    }

    export let params = {
        competitionId: undefined,
    }

    fetchTeams();
</script>

<h2>Nova ekipa</h2>

<div class="full-width">
    <TextField bind:value={name} name="Ime ekipe"></TextField>
</div>

<p/>

<Button type="filled" on:click={newTeam}>Ustvari novo ekipo</Button>

<h2>Trenutne ekipe</h2>

{#if teams.length === 0}
    <i>Ničesar (še) ni tukaj :(</i>
{:else}
    <table>
        <thead>
        <tr>
            <th scope="col">Ekipa</th>
            <th scope="col">Spremeni ime</th>
            <th scope="col">Izbriši</th>
        </tr>
        </thead>
        <tbody>
        {#each teams as c}
            <tr>
                <th scope="row">
                    <div class="full-width">
                        <TextField bind:value={c.Name} name="Ime ekipe"></TextField>
                    </div>
                </th>
                <td>
                    <Button on:click={() => changeTeamName(c.ID, c.Name)} type="elevated" iconType="full">
                        <Icon icon={iconCheck} />
                    </Button>
                </td>
                <td>
                    <Button on:click={() => deleteTeam(c.ID)} type="elevated" iconType="full">
                        <Icon icon={iconDelete} />
                    </Button>
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
{/if}

<SnackbarAnim bind:show={snackbar} />
