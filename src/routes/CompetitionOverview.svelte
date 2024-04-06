<script lang="ts">
    import {Button, CircularProgressIndeterminate, SegmentedButtonContainer, SegmentedButtonItem} from "m3-svelte";
    import {push} from 'svelte-spa-router'
    import {link} from 'svelte-spa-router'
    import {baseurl, production} from "../lib/consts";
    import { flip } from 'svelte/animate';


    let competition: any | null = null;
    let wsConnEstablished = false;

    let recentSubmissions: any[] = [];

    async function fetchCompetition() {
        let response: Response;
        try {
            response = await fetch(`${baseurl}/competition/${params.competitionId}`, {method: "GET", credentials: production ? undefined : "include"});
        } catch (e) {
            await push("/prijava")
            return;
        }
        if (response.status !== 200) {
            await push("/prijava")
            return;
        }
        competition = (await response.json()).data;
        for (let i = 0; i < competition.Teams.length; i++) {
            competition.Teams[i].Position = i + 1;
            competition.Teams[i].ArrayPosition = i + 1;
            if (i === 0) continue;
            if (competition.Teams[i - 1].TotalScore !== competition.Teams[i].TotalScore) continue;
            competition.Teams[i].Position = competition.Teams[i - 1].Position;
        }
        establishWebsocketConnection();
    }

    async function updateCompetition() {
        let fd = new FormData();
        fd.append("status", competition.Competition.Status);

        let response: Response;
        try {
            response = await fetch(`${baseurl}/competition/${params.competitionId}`, {method: "PATCH", body: fd, credentials: production ? undefined : "include"});
        } catch (e) {
            return;
        }
        if (response.status !== 200) {
            return;
        }
        await fetchCompetition();
    }

    function establishWebsocketConnection() {
        const socket = new WebSocket(`${baseurl.replace("https://", "wss://").replace("http://", "ws://")}/competition/${params.competitionId}/websocket`);

        // Connection opened
        socket.addEventListener("open", (event) => {
            wsConnEstablished = true;
            recentSubmissions = [];
        });

        // Listen for messages
        socket.addEventListener("message", (event) => {
            console.log("Message from server ", event.data);
            let data = JSON.parse(event.data);
            if (data.message_type === 0) {
                recentSubmissions.unshift({
                    submission_id: data.submission,
                    team_name: data.team_name,
                    team_id: data.team_id,
                    problem_id: data.problem_id,
                    problem_name: data.problem_name,
                    score: 0,
                    verdict: "ČAKA NA OCENJEVALCA",
                    submissions_before: 0,
                    max_score: data.max_score,
                    time: new Date(),
                });
                if (recentSubmissions.length > 3) {
                    recentSubmissions.pop();
                }
                recentSubmissions = recentSubmissions;
            } else if (data.message_type === 1) {
                console.log("Message type 1");
                for (let i = 0; i < recentSubmissions.length; i++) {
                    if (recentSubmissions[i].submission_id !== data.submission) continue;
                    recentSubmissions[i].problem_id = data.problem_id;
                    recentSubmissions[i].problem_name = data.problem_name;
                    recentSubmissions[i].team_id = data.team_id;
                    recentSubmissions[i].team_name = data.team_name;
                    recentSubmissions[i].score = data.score;
                    recentSubmissions[i].verdict = data.verdict;
                    recentSubmissions[i].submissions_before = data.submissions_before;
                    recentSubmissions[i].max_score = data.max_score;
                    recentSubmissions[i].time = new Date();
                    break;
                }
                console.log("Looking for problemint");
                let problemInt = -1;
                for (let i = 0; i < competition.Problems.length; i++) {
                    let problem = competition.Problems[i];
                    if (problem.ID !== data.problem_id) continue;
                    problemInt = i;
                    break;
                }
                if (problemInt === -1) {
                    console.log("Problemint is -1")
                    return;
                }
                console.log("Searching for teams", competition.Teams);
                let compt = JSON.parse(JSON.stringify(competition.Teams))
                for (let i = 0; i < compt.length; i++) {
                    let team = compt[i];
                    if (team.Team.ID !== data.team_id) continue;
                    console.log("Found the team", team);
                    if (compt[i].Problems[problemInt] === null) {
                        console.log("Problem is null");
                        compt[i].Problems[problemInt] = {
                            LatestSubmission: {
                                ID: data.submission,
                                Verdict: data.verdict,
                                Score: data.score,
                            },
                            SubmissionsBefore: data.submissions_before,
                        };
                        compt[i].TotalScore = data.total_score;
                        compt.sort((a: any, b: any) => b.TotalScore - a.TotalScore);
                        for (let i = 0; i < compt.length; i++) {
                            compt[i].Position = i + 1;
                            if (i === 0) continue;
                            if (compt[i - 1].TotalScore !== compt[i].TotalScore) continue;
                            compt[i].Position = compt[i - 1].Position;
                        }
                        competition.Teams = compt;
                        break;
                    }
                    compt[i].Problems[problemInt].LatestSubmission.ID = data.submission;
                    compt[i].Problems[problemInt].LatestSubmission.Verdict = data.verdict;
                    compt[i].Problems[problemInt].LatestSubmission.Score = data.score;
                    compt[i].Problems[problemInt].SubmissionsBefore = data.submissions_before;

                    compt[i].TotalScore = data.total_score;
                    compt.sort((a: any, b: any) => b.TotalScore - a.TotalScore);
                    for (let i = 0; i < compt.length; i++) {
                        compt[i].Position = i + 1;
                        if (i === 0) continue;
                        if (compt[i - 1].TotalScore !== compt[i].TotalScore) continue;
                        compt[i].Position = compt[i - 1].Position;
                    }
                    break;
                }
                competition.Teams = compt;
            } else if (data.message_type === 2) {
                for (let i = 0; i < recentSubmissions.length; i++) {
                    if (recentSubmissions[i].submission_id !== data.old_submission) continue;
                    recentSubmissions[i].submission_id = data.new_submission;
                    break;
                }
            }
        });

        // Connection opened
        socket.addEventListener("close", (event) => {
            wsConnEstablished = false;
        });
    }

    function fullScreen() {
        const elem = document.getElementById("full-screen");
        if (elem === null) return;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        }

    }

    export let params = {
        competitionId: undefined
    }

    fetchCompetition();
</script>

{#if competition !== null}
    <h2>Pregled tekmovanja: {competition.Competition.Name} <Button type="filled" on:click={fullScreen}>Celozaslonski način</Button></h2>

    Status:

    <SegmentedButtonContainer>
        <input type="radio" on:click={async () => {
            competition.Competition.Status = 0;
            await updateCompetition();
        }} name="segmented-b" id="segmented-b-0" checked={competition.Competition.Status === 0} />
        <SegmentedButtonItem input="segmented-b-0">Čaka na začetek</SegmentedButtonItem>
        <input type="radio" on:click={async () => {
            competition.Competition.Status = 1;
            await updateCompetition();
        }} name="segmented-b" id="segmented-b-1" checked={competition.Competition.Status === 1} />
        <SegmentedButtonItem input="segmented-b-1">V teku</SegmentedButtonItem>
        <input type="radio" on:click={async () => {
            competition.Competition.Status = 2;
            await updateCompetition();
        }} name="segmented-b" id="segmented-b-2" checked={competition.Competition.Status === 2} />
        <SegmentedButtonItem input="segmented-b-2">Končano</SegmentedButtonItem>
    </SegmentedButtonContainer>

    <div id="full-screen">
        <h3>Zadnje evaluirane oddaje</h3>

        <table>
            <thead>
            <tr>
                <th scope="col" style="text-align: center;">Ekipa</th>
                <th scope="col" style="text-align: center;">Problem</th>
                <th scope="col" style="text-align: center;">Evaluacija</th>
            </tr>
            </thead>
            <tbody>
            {#if wsConnEstablished}
                {#if recentSubmissions.length === 0}
                    <tr><td colspan="3">Za zdaj še ni ničesar :(</td></tr>
                {:else}
                    {#each recentSubmissions as submission}
                        {@const verdict = submission.verdict}
                        <tr>
                            <th scope="row">{submission.team_name}</th>
                            <td class="big-text">{submission.problem_name}</td>
                            <td class="{(verdict === 'AC' || verdict === 'OK') ? 'green' : (verdict === 'PART' || verdict === 'MAN') ? 'yellow' : (verdict === 'CF' || verdict === 'SOL_CF' || verdict === 'SOL_RTE' || verdict === 'RTE') ? 'black' : (verdict === 'ČAKA NA OCENJEVALCA') ? 'grey' : 'red'} big-text upper">
                                {submission.verdict} – {submission.score}/{submission.max_score} (+{submission.submissions_before})
                            </td>
                        </tr>
                    {/each}
                {/if}
            {:else}
                <tr><td colspan="3">
                    <CircularProgressIndeterminate />
                    <br>
                    Čakam na WebSocket povezavo s strežnikom!<br>
                    Če menite, da je to napaka, o tem obvestite tekmovalno komisijo.
                </td></tr>
            {/if}
            </tbody>
        </table>

        <h3>Skupni seštevek</h3>

        <table>
            <thead>
            <tr>
                <th scope="col">Mesto</th>
                <th scope="col">Ekipa</th>
                {#each competition.Problems as problem}
                <th scope="col">{problem.Name} ({problem.Points})</th>
                {/each}
                <th scope="col">Skupaj</th>
            </tr>
            </thead>
            <tbody>
            {#each competition.Teams as team (team.ArrayPosition)}
                <tr animate:flip>
                    <th scope="row">{team.Position}.</th>
                    <th scope="row">{team.Team.Name}</th>
                    {#each team.Problems as problem, i}
                        {#if problem !== null}
                            {@const verdict = problem.LatestSubmission.Verdict}
                            {@const score = `${problem.LatestSubmission.Score}/${competition.Problems[i].Points}`}
                            {@const resubmissions = problem.SubmissionsBefore > 0 ? `(+${problem.SubmissionsBefore})` : ''}
                            {#if verdict === "AC" || verdict === "OK"}
                                <td class="green"><span class="big-text upper"><a use:link={`/oddaja/${problem.LatestSubmission.ID}`}>{verdict}</a></span><br><span class="medium-text">{score} {resubmissions}</span></td>
                            {:else if verdict === "PART" || verdict === "MAN"}
                                <td class="yellow"><span class="big-text upper"><a use:link={`/oddaja/${problem.LatestSubmission.ID}`}>{verdict}</a></span><br><span class="medium-text">{score} {resubmissions}</span></td>
                            {:else if verdict === "CF" || verdict === "SOL_CF" || verdict === "SOL_RTE" || verdict === "RTE"}
                                <td class="black"><span class="big-text upper"><a use:link={`/oddaja/${problem.LatestSubmission.ID}`}>{verdict}</a></span><br><span class="medium-text">{score} {resubmissions}</span></td>
                            {:else}
                                <td class="red"><span class="big-text upper"><a use:link={`/oddaja/${problem.LatestSubmission.ID}`}>{verdict}</a></span><br><span class="medium-text">{score} {resubmissions}</span></td>
                            {/if}
                        {:else}
                            <td/>
                        {/if}
                    {/each}
                    <td class="big-text upper">{team.TotalScore}</td>
                </tr>
            {/each}
            </tbody>
        </table>
    </div>
{:else}
{/if}
