<script lang="ts">
    import {baseurl} from "../lib/consts";
    import {Button, SnackbarAnim, type SnackbarIn, TextField} from "m3-svelte";
    import {push} from "svelte-spa-router";
    import type {HTMLInputAttributes} from "svelte/elements";

    let snackbar: (data: SnackbarIn) => void;

    let username = "";
    let password = "";
    let repeatPassword = "";

    let passwordOptions: HTMLInputAttributes = {};
    passwordOptions.type = "password";

    async function register() {
        if (password !== repeatPassword) {
            snackbar({ message: "Gesli se ne ujemata!", closable: true });
            return;
        }

        if (password.length < 8) {
            snackbar({ message: "Geslo mora biti dolgo vsaj 8 znakov!", closable: true });
            return;
        }

        let fd = new FormData();
        fd.append("username", username);
        fd.append("password", password);

        let response: Response;
        try {
            response = await fetch(`${baseurl}/user/new`, {method: "POST", body: fd});
        } catch (e) {
            snackbar({ message: "Napaka pri izvedbi zahtevka!", closable: true });
            return;
        }
        if (response.status !== 201) {
            snackbar({ message: "Napaka pri prijavi!", closable: true });
            return;
        }
        await push("/prijava")
    }
</script>

<h2>Ocenjevalec</h2>
<div class="full-width"><TextField bind:value={username} name="Uporabniško ime"></TextField></div>

<div class="full-width"><TextField extraOptions={passwordOptions} bind:value={password} name="Geslo"></TextField></div>

<div class="full-width"><TextField extraOptions={passwordOptions} bind:value={repeatPassword} name="Ponovi geslo"></TextField></div>

<p/>

<Button type="filled" on:click={register}>Registracija</Button>

<Button type="outlined" on:click={() => push("/prijava")}>Prijava</Button>

<SnackbarAnim bind:show={snackbar} />
