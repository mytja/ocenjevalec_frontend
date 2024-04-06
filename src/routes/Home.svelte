<script lang="ts">
    import {Button, Icon} from "m3-svelte";
    import {push} from 'svelte-spa-router'
    import {link} from 'svelte-spa-router'
    import {baseurl, production} from "../lib/consts";
    import iconDelete from "@ktibow/iconset-material-symbols/delete";

    let competitions = [];

    async function fetchCompetitions() {
        let response: Response;
        try {
            response = await fetch(`${baseurl}/competitions`, {method: "GET", credentials: production ? undefined : "include"});
        } catch (e) {
            await push("/prijava")
            return;
        }
        if (response.status !== 200) {
            await push("/prijava")
            return;
        }
        competitions = (await response.json()).data;
    }

    async function deleteCompetition(id: string) {
        let response: Response;
        try {
            response = await fetch(`${baseurl}/competition/${id}`, {method: "DELETE", credentials: production ? undefined : "include"});
        } catch (e) {
            return;
        }
        if (response.status !== 200) {
            return;
        }
        await fetchCompetitions();
    }

    fetchCompetitions();
</script>

<h2>Ocenjevalec</h2>

<p>Ocenjevalec je program za digitalno ocenjevanje rešitev vzvratnega inženirstva vezij, sestavljenih iz logičnih vrat.
    Sestavljen za delavnico na Astronomskem in naravoslovnem taboru Gimnazije Bežigrad.</p>

<!--<Button type="filled" on:click={() => push("/novo_tekmovanje")}>Novo tekmovanje</Button>-->

<h3>Vsa tekmovanja</h3>

{#if competitions.length === 0}
    <i>Ničesar (še) ni tukaj :(</i>
{:else}
    <table>
        <thead>
        <tr>
            <th scope="col">Tekmovanje</th>
            <th scope="col">Stanje</th>
            <th scope="col">Izbriši</th>
        </tr>
        </thead>
        <tbody>
        {#each competitions as c}
            <tr>
                <th scope="row"><a use:link={`/tekmovanje/${c.ID}`}>{c.Name}</a></th>
                {#if c.Status === 0}
                    <td class="purple big-text upper">Čaka na začetek</td>
                {:else if c.Status === 1}
                    <td class="green big-text upper">V teku</td>
                {:else}
                    <td class="yellow big-text upper">Končano</td>
                {/if}
                <td>
                    <Button on:click={() => deleteCompetition(c.ID)} type="elevated" iconType="full">
                        <Icon icon={iconDelete} />
                    </Button>
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
{/if}

<p/>

<hr>

<p>Copyright 2024 Mitja Ševerkar. Vse pravice pridržane.</p>
