<script lang="ts">
    import {baseurl, production} from "../lib/consts";
    import {Button, SnackbarAnim, type SnackbarIn, TextField} from "m3-svelte";
    import {push} from "svelte-spa-router";
    import type {HTMLInputAttributes} from "svelte/elements";

    let snackbar: (data: SnackbarIn) => void;

    let username = "";
    let password = "";

    let passwordOptions: HTMLInputAttributes = {};
    passwordOptions.type = "password";

    async function login() {
        let fd = new FormData();
        fd.append("username", username);
        fd.append("password", password);

        let response: Response;
        try {
            response = await fetch(`${baseurl}/user/login`, {method: "POST", body: fd, credentials: production ? undefined : "include"});
        } catch (e) {
            snackbar({ message: "Napaka pri izvedbi zahtevka!", closable: true });
            return;
        }
        if (response.status !== 200) {
            snackbar({ message: "Napaka pri prijavi!", closable: true });
            return;
        }
        await push("/")
    }
</script>

<h2>Ocenjevalec</h2>

<div class="full-width"><TextField bind:value={username} name="Uporabniško ime"></TextField></div>

<div class="full-width"><TextField extraOptions={passwordOptions} bind:value={password} name="Geslo"></TextField></div>

<p/>

<Button type="filled" on:click={login}>Prijava</Button>

<Button type="outlined" on:click={() => push("/registracija")}>Registracija</Button>

<SnackbarAnim bind:show={snackbar} />
