// Components: only Home, Loading and NotFound are statically included in the bundle
import Home from './routes/Home.svelte'
import NotFound from './routes/NotFound.svelte'
import NewCompetition from "./routes/NewCompetition.svelte";
import NewSubmission from "./routes/NewSubmission.svelte";
import wrap from "svelte-spa-router/wrap";
import Loading from "./routes/Loading.svelte";
import Login from "./routes/Login.svelte";
import Registration from "./routes/Registration.svelte";
import Teams from "./routes/Teams.svelte";
import Problems from "./routes/Problems.svelte";
import Submission from "./routes/Submission.svelte";

// Export the route definition object
export default {
    // Exact path
    '/': Home,
    '/prijava': Login,
    '/registracija': Registration,
    '/novo_tekmovanje': NewCompetition,
    '/tekmovanje/:competitionId': wrap({
        asyncComponent: () => import('./routes/CompetitionOverview.svelte'),
        loadingComponent: Loading,
    }),
    '/tekmovanje/:competitionId/nova_oddaja': NewSubmission,
    '/tekmovanje/:competitionId/ekipe': Teams,
    '/tekmovanje/:competitionId/problemi': Problems,
    '/oddaja/:submissionId': Submission,

    // Catch-all, must be last
    '*': NotFound,
}
