<script lang="ts">
    import {Button, Slider, SliderTicks, SnackbarAnim, type SnackbarIn, TextField} from "m3-svelte";
    import {push} from 'svelte-spa-router'
    import {baseurl, production} from "../lib/consts";

    let snackbar: (data: SnackbarIn) => void;

    let penalty = 20;
    let penalty_each = 15;

    async function newCompetition() {
        let fd = new FormData();
        fd.append("name", name);
        fd.append("penalty", penalty.toString());
        fd.append("penalty_each", penalty_each.toString())

        let response: Response;
        try {
            response = await fetch(`${baseurl}/competitions`, {method: "POST", body: fd, credentials: production ? undefined : "include"});
        } catch (e) {
            snackbar({ message: "Napaka pri izvajanju zahtevka!", closable: true });
            return;
        }
        if (response.status !== 201) {
            snackbar({ message: "Napaka pri ustvarjanju tekmovanja!", closable: true });
            return;
        }
        await push("/");
    }

    let name = "";
</script>

<h2>Novo tekmovanje</h2>

<TextField bind:value={name} name="Ime tekmovanja"></TextField>

<p/>

Časovna kazen: <SliderTicks step={1} min={0} max={100} bind:value={penalty} />

<p/>

Zamik med kaznimi: <SliderTicks step={1} min={0} max={100} bind:value={penalty_each} />

<p/>

Nastavljeno imate kazen {penalty} točk vsakih {penalty_each} minut.

<p/>

<Button type="filled" on:click={newCompetition}>Novo tekmovanje</Button>

<SnackbarAnim bind:show={snackbar} />
