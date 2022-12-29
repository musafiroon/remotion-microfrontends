# Remotion Microfrontends

An experiment, to investigate the feasibility of loading remotion compositions over a URL.

## Background

There are two projects, [my-chassis](./my-chassis/) and [my-video](./my-video/).

[my-chassis](/my-chassis/) is the root project, which loads compositions defined in [my-video](./my-video/)

## Note

- CORS may prevent assets of one project from being loaded in the browser when running the other project, so I use [Allow CORS](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=en-US), a chrome extension to disable CORS so I can keep experimenting.
- Remotion keeps complaining about there being multiple versions of itself running, even though I have set it up as a shared module in webpack's module-federation. I have gotten around this by setting `window.remotion_imported = false`, and this can be discussed later.
- Hooks like `useCurrentFrame()` and `useVideoConfig()` are very important for rendering a video

## Goals

A microfrontend component should:

1. Continue to work as expected with hooks such as:
    - `useVideoConfig()`
    - `useCurrentFrame()`

2. Use remotion's `delayRender` and `continueRender` when loading
