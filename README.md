![](https://img.shields.io/badge/Built%20with%20%E2%9D%A4%EF%B8%8F-at%20Technologiestiftung%20Berlin-blue)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

# Geoexplorer

**This application is a prototype. It may contain errors and small bugs. If you notice something you can report an issue. Thank you!**

Geo data is required for a large number of projects. A wealth of knowledge about Berlin lies dormant in the open datasets. Can AI help to find and understand this data more quickly, evaluate its relevance for a project and perhaps even create completely new ideas? The GeoExplorer was developed based on these questions. It is part of a feasibility study on open data and AI carried out by the [Open Data Informationsstelle Berlin](https://odis-berlin.de/).

![screenshot](/public/images/social_image_1280_x_640.png)

## Context

The prototype tool GeoExplorer is designed to help you find and quickly understand geo data. Thanks to AI support, the tool searches for suitable or nearby geodata sets based on your query. You can also delve deeper into each dataset description and have a AI explain the content to you.

The open geo data is stored in the Berlin geo data infrastructure, which is operated by the Senate Department for Urban Development, Building and Housing (SenSBW). GeoExplorer only accesses the metadata. It is not an alternative the other open data portals of Berlin such as the FIS-Broker or the Berlin Open Data Portal, but is intended to provide an opportunity for users who are not yet familiar with geo data from the Berlin administration.

Other, non-spatial data from the Open Data Portal has not yet been taken into account for the Explorer at this point in time, as these generally have significantly less good metadata.

## How does the search work?

For each dataset, metadata was automatically scraped (collected) from [Berlins Open Data Portal](https://daten.berlin.de/) and [Berlins Geo Data Portal (FisBroker)](https://fbinter.stadt-berlin.de/fb/).

> Metadata is data that describes a dataset, e.g. the attributes that a dataset has or the descriptive text written by a human.

Afterwards, a so-called embedding was created for each individual metadata set and written to a database. Each embedding contains a special vector based on the content of the metadata.

> A vector is like a kind of multidimensional coordinate that locates the content of the metadata in the logic of the AI.
> Example: The vectors for the terms “dog” and “cat” would be located closer than the term “car” because both are animals.

When you enter a search query, a vector is created and compared with the existing vectors in the database. If the vectors have a certain proximity to each other, the respective embeddings are displayed in the search result.

## Tech stack

This website is a NextJS app configured with:

- [Typescript](https://www.typescriptlang.org/)
- Linting with [ESLint](https://eslint.org/)
- Formatting with [Prettier](https://prettier.io/)

## Project structure

Basic Next.js app

## Getting started

### Requirements

#### Node.js

This project is a Next.js app which requires you to have [Node.js](https://nodejs.org/en/) installed.

### Installation

Clone the repository to your local machine:

```bash
git clone git@github.com:technologiestiftung/odis-geoexplorer
```

Move into the repository folder:

```bash
cd odis-geoexplorer
```

Make sure you use the Node.js version specified in `.nvmrc`. Find out which Node version you're currently on with:

```bash
node --version
```

If this version differs from the one specified in `.nvmrc`, please install the required version, either manually, or using a tool such as [nvm](https://github.com/nvm-sh/nvm), which allows switching to the correct version via:

```bash
nvm use
```

With the correct Node version, install the dependencies.
NOTE: We use **pnpm** here not npm!

```bash
pnpm install
```

The app queries data from the [Supabase DB API](https://www.supabase.com/) and [Open AI](https://www.openai.com/). You will need to provide connection details in your environment. In this repository you can find a file `.env.example`. Duplicate this file and name it `.env`.

In `.env` you must enter the connection details suggested in `.env.example`. If you do not know how to obtain the necessary details, please ask a repository maintainer for access.

You are now ready to start a local development server on http://localhost:3000 via:

```bash
pnpm dev
```

## Data

You can explore 1662 datasets (as at 3 July 2024). WMS that exist as WFS (except arial images) have no been included in the search.

You can find more information about the data on this [Github repo](https://github.com/technologiestiftung/odis-geoexplorer-data).

## Backend

The embeddings are hosted on [Supabase](https://www.supabase.com/) - a service that allows you to host a PostgreSQL database and query it via an API.

## Workflow

New features, fixes, etc. should always be developed on a separate branch:

- In your local repository, checkout the `main` branch.
- Run `git checkout -b <name-of-your-branch>` to create a new branch (ideally following [Conventional Commits guidelines](https://www.conventionalcommits.org)).
- Make your changes
- Push your changes to the remote: `git push -u origin HEAD`
- Open a pull request.

You can commit using the `npm run cm` command to ensure your commits follow our conventions.

## Deployment

The app is deployed to the cloud with [Netlify](https://www.netlify.com/).

## Page analytics

We use [Matomo](https://matomo.org/) for website analytics. Matomo is respectful of the users' privacy, the page visits are tracked anonymously.

In the production environment, a `NEXT_PUBLIC_MATOMO_URL` and `NEXT_PUBLIC_MATOMO_SITE_ID` is configured for this purpose.

## Contributing

Before you create a pull request, write an issue so we can discuss your changes.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://hanshack.com/"><img src="https://avatars.githubusercontent.com/u/8025164?v=4?s=64" width="64px;" alt="Hans Hack"/><br /><sub><b>Hans Hack</b></sub></a><br /><a href="https://github.com/technologiestiftung/odis-geoexplorer/commits?author=hanshack" title="Code">💻</a> <a href="#content-hanshack" title="Content">🖋</a> <a href="#data-hanshack" title="Data">🔣</a> <a href="https://github.com/technologiestiftung/odis-geoexplorer/commits?author=hanshack" title="Documentation">📖</a> <a href="#projectManagement-hanshack" title="Project Management">📆</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://alsino.io"><img src="https://avatars.githubusercontent.com/u/8008434?v=4?s=64" width="64px;" alt="alsino"/><br /><sub><b>alsino</b></sub></a><br /><a href="https://github.com/technologiestiftung/odis-geoexplorer/commits?author=alsino" title="Code">💻</a> <a href="#content-alsino" title="Content">🖋</a> <a href="#data-alsino" title="Data">🔣</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Lisa-Stubert"><img src="https://avatars.githubusercontent.com/u/61182572?v=4?s=64" width="64px;" alt="Lisa-Stubert"/><br /><sub><b>Lisa-Stubert</b></sub></a><br /><a href="#content-Lisa-Stubert" title="Content">🖋</a> <a href="#projectManagement-Lisa-Stubert" title="Project Management">📆</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://fhp.incom.org/profile/9200/projects"><img src="https://avatars.githubusercontent.com/u/46717848?v=4?s=64" width="64px;" alt="anna"/><br /><sub><b>anna</b></sub></a><br /><a href="#design-annameide" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/KlemensM"><img src="https://avatars.githubusercontent.com/u/98896505?v=4?s=64" width="64px;" alt="Klemens"/><br /><sub><b>Klemens</b></sub></a><br /><a href="#content-KlemensM" title="Content">🖋</a> <a href="#projectManagement-KlemensM" title="Project Management">📆</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Content Licensing

Texts and content available as [CC BY](https://creativecommons.org/licenses/by/3.0/de/).

## Credits

<table>
  <tr>
      <td>
      Made by: <a href="https://odis-berlin.de">
        <br />
        <br />
        <img width="200" src="https://logos.citylab-berlin.org/logo-odis-berlin.svg" />
      </a>
    </td>
    <td>
       Together with: <a href="https://citylab-berlin.org/de/start/">
        <br />
        <br />
        <img width="200" src="https://logos.citylab-berlin.org/logo-citylab-berlin.svg" />
      </a>
    </td>
    <td>
      A project by <a href="https://www.technologiestiftung-berlin.de/">
        <br />
        <br />
        <img width="150" src="https://logos.citylab-berlin.org/logo-technologiestiftung-berlin-de.svg" />
      </a>
    </td>
    <td>
      Supported by <a href="https://www.berlin.de/rbmskzl/">
        <br />
        <br />
        <img width="80" src="https://logos.citylab-berlin.org/logo-berlin-senatskanzelei-de.svg" />
      </a>
    </td>
  </tr>
</table>

## Related Projects
