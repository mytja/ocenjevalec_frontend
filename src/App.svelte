<script lang="ts">
  import {NavList, NavListLink, StyleFromScheme} from "m3-svelte";
  import iconHome from "@ktibow/iconset-material-symbols/home-outline";
  import iconHomeS from "@ktibow/iconset-material-symbols/home";
  import iconAdd from "@ktibow/iconset-material-symbols/add";
  import iconAddS from "@ktibow/iconset-material-symbols/add";
  import iconGroup from "@ktibow/iconset-material-symbols/group-outline";
  import iconGroupS from "@ktibow/iconset-material-symbols/group";
  import iconProblem from "@ktibow/iconset-material-symbols/question-mark";
  import iconTrendingUp from "@ktibow/iconset-material-symbols/trending-up";
  import Router, {location} from 'svelte-spa-router';
  import {link, params} from 'svelte-spa-router';
  import routes from './routes';

  const paths = [
    {
      path: "/",
      icon: iconHome,
      iconS: iconHomeS,
      label: "Domov",
    },
    {
      path: "/novo_tekmovanje",
      icon: iconAdd,
      iconS: iconAddS,
      label: "Novo tekmovanje",
    },
  ];

  const competitionPaths = [
    {
      path: "/",
      icon: iconHome,
      iconS: iconHomeS,
      label: "Domov",
    },
    {
      path: "/tekmovanje/:tekm:",
      icon: iconTrendingUp,
      iconS: iconTrendingUp,
      label: "Statistika tekmovanja",
    },
    {
      path: "/tekmovanje/:tekm:/nova_oddaja",
      icon: iconAdd,
      iconS: iconAddS,
      label: "Nova oddaja",
    },
    {
      path: "/tekmovanje/:tekm:/ekipe",
      icon: iconGroup,
      iconS: iconGroupS,
      label: "Ekipe",
    },
    {
      path: "/tekmovanje/:tekm:/problemi",
      icon: iconProblem,
      iconS: iconProblem,
      label: "Problemi",
    },
  ];

  const submissionPaths = [
    {
      path: "/",
      icon: iconHome,
      iconS: iconHomeS,
      label: "Domov",
    },
    {
      path: "/oddaja/:odd:",
      icon: iconTrendingUp,
      iconS: iconTrendingUp,
      label: "Oddaja",
    },
  ];

</script>

<main>
  <div class="container">
    <div class="sidebar">
      <NavList type="auto">
        <div class="items">
          {#each ($location.startsWith("/tekmovanje/") ? competitionPaths : ($location.startsWith("/oddaja/") ? submissionPaths : paths)) as { path, icon, iconS, label }}
            {@const p1 = path.replace(":tekm:", ($params !== undefined && $params !== null && $params.competitionId !== undefined) ? $params.competitionId : "")}
            {@const p = p1.replace(":odd:", ($params !== undefined && $params !== null && $params.submissionId !== undefined) ? $params.submissionId : "")}
            {@const selected = $location === p}
            <a use:link={p}>
              <NavListLink type="auto" href="#" {selected} icon={selected ? iconS : icon}>
                {label}
              </NavListLink>
            </a>
          {/each}
        </div>
      </NavList>
    </div>
    <div class="content">
      <Router {routes} />
    </div>
  </div>
  <StyleFromScheme
          lightScheme={{"primary":4280904264,"onPrimary":4294967295,"primaryContainer":4289655494,"onPrimaryContainer":4278198545,"inversePrimary":4287813035,"secondary":4283327317,"onSecondary":4294967295,"secondaryContainer":4291946710,"onSecondaryContainer":4278984468,"tertiary":4282082417,"onTertiary":4294967295,"tertiaryContainer":4290767352,"onTertiaryContainer":4278198055,"error":4290386458,"onError":4294967295,"errorContainer":4294957782,"onErrorContainer":4282449922,"background":4294376436,"onBackground":4279704857,"surface":4294376436,"onSurface":4279704857,"surfaceVariant":4292666844,"onSurfaceVariant":4282403138,"inverseSurface":4281086509,"inverseOnSurface":4293784299,"outline":4285626738,"outlineVariant":4290824640,"shadow":4278190080,"scrim":4278190080,"surfaceDim":4292271061,"surfaceBright":4294376436,"surfaceContainerLowest":4294967295,"surfaceContainerLow":4293981678,"surfaceContainer":4293586920,"surfaceContainerHigh":4293192419,"surfaceContainerHighest":4292863197,"surfaceTint":4280904264}}
          darkScheme={{"primary":4287813035,"onPrimary":4278204704,"primaryContainer":4278669874,"onPrimaryContainer":4289655494,"inversePrimary":4280904264,"secondary":4290104506,"onSecondary":4280366376,"secondaryContainer":4281813822,"onSecondaryContainer":4291946710,"tertiary":4288925148,"onTertiary":4278465857,"tertiaryContainer":4280437848,"onTertiaryContainer":4290767352,"error":4294948011,"onError":4285071365,"errorContainer":4287823882,"onErrorContainer":4294957782,"background":4279178513,"onBackground":4292863197,"surface":4279178513,"onSurface":4292863197,"surfaceVariant":4282403138,"onSurfaceVariant":4290824640,"inverseSurface":4292863197,"inverseOnSurface":4281086509,"outline":4287271819,"outlineVariant":4282403138,"shadow":4278190080,"scrim":4278190080,"surfaceDim":4279178513,"surfaceBright":4281678646,"surfaceContainerLowest":4278849292,"surfaceContainerLow":4279704857,"surfaceContainer":4279968029,"surfaceContainerHigh":4280691495,"surfaceContainerHighest":4281415218,"surfaceTint":4287813035}} />
</main>

<style>
  .container {
    display: flex;
    min-height: 100vh;
  }
  .sidebar {
    position: sticky;
    align-self: flex-start;
    display: flex;
    width: 5rem;
    flex-shrink: 0;
  }
  .content {
    padding: 1rem;
  }
  @media (max-width: 37.5rem) {
    .container {
      flex-direction: column-reverse;
      --m3-util-bottom-offset: 5rem;
    }
    .sidebar {
      bottom: 0;
      width: 100%;
      z-index: 3;
    }
    .fab {
      position: fixed;
      right: 1rem;
      bottom: 6rem;
    }
    .items {
      display: contents;
    }
  }
  @media (min-width: 37.5rem) {
    .content {
      flex-grow: 1;
      padding: 1.5rem;
    }
    .sidebar {
      top: 0;
      left: 0;
      flex-direction: column;
      min-height: 100vh;
    }
    .fab {
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 2;
      margin-bottom: 1.5rem;
    }
    .fab > :global(button) {
      box-shadow: none !important;
    }
    .items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      justify-content: center;
    }
    @media (min-height: 30rem) {
      .items {
        position: absolute;
        inset: 0;
      }
      @media (max-height: 35rem) {
        .items {
          padding-top: 3.5rem;
        }
      }
    }
  }
</style>
