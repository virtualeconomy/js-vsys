# Developing Documentation

- [Developing Documentation](#developing-documentation)
  - [Workflow](#workflow)
  - [Set Up Development Environment](#set-up-development-environment)
  - [Set up Automated Testing with Github Action](#set-up-automated-testing-with-github-action)
  - [Code Style](#code-style)
  - [Git Commit Style](#git-commit-style)
    - [Commit Format](#commit-format)
  - [Branch & PR Naming Convention](#branch--pr-naming-convention)
  - [Github Issue Naming Convention](#github-issue-naming-convention)
  - [Doc String Guide](#doc-string-guide)

## Workflow

[Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) is used for contributors within the Github organization [virtualeconomy](https://github.com/virtualeconomy). Please check out a new feature branch based on `develop` branch and create PR targeting the `develop` branch. The repository maintainer will merge `develop` branch into `main` branch by creating a release regularly.

[Forking Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow) is used for contributors outside the Github organization [virtualeconomy](https://github.com/virtualeconomy). Please work on a forked repo and create a PR from the forked repo to the `develop` branch of the main repo.

## Set Up Development Environment

The development requires [the latest LTS of Node.js](https://nodejs.org/en/). Dependencies for development will be managed by [npm](https://www.npmjs.com/).

To set up the development environment, go to the project root directory and

1. Install dependencies

   ```bash
   npm install
   ```

2. Install Git hooks with [pre-commit](https://github.com/pre-commit/pre-commit) so that the fommatter will be invoked whenever a commit is created.

   ```bash
   pre-commit install
   ```

## Set up Automated Testing with Github Action

This project comes with a [Github Action workflow script](../.github/workflows/test.yml) to automatically run test cases on a new git push to the `develop` & `main` branch .

Ensure to add [required repository secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) as per the [Github Action workflow script](../.github/workflows/test.yml) when enabling for Github Action to work properly.

## Code Style

It is specified in [the Prettier config file](../.prettierrc.json).

## Git Commit Style

We use a **simplified** version of [Angular Commit style](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-format).

### Commit Format

```
<type>: <short summary>
  │               │
  │               └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │
  └─⫸ Commit Type: build|docs|feat|fix|refactor|test|chore
```

Commit Type must be one of the following:

- **build**: Changes that relate to dependencies, CI, release, etc
- **docs**: Documentation only changes
- **feat**: A new feature
- **fix**: A bug fix
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests
- **chore**: Other trivial changes

## Branch & PR Naming Convention

A branch and the PR comes from it should be small(i.e. contains small-scale changes for only 1 aspect).

The naming convention for branch

```
type/short-summary-in-lower-case
  │               │
  │               └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │
  └─⫸ Commit Type: build|docs|feat|fix|refactor|test|chore
```

The naming convention for PR

```
type: short summary in lower case
  │               │
  │               └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │
  └─⫸ Commit Type: build|docs|feat|fix|refactor|test|chore
```

For example, say we would like to add the branch naming convention to the documentation.
The branch name should look like

```
docs/add-branch-naming-convention
```

The PR should look like

```
docs: add branch naming convention
```

## Github Issue Naming Convention

The naming convention for Github issues conforms to the PR one.

```
type: short summary in lower case
  │               │
  │               └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │
  └─⫸ Commit Type: build|docs|feat|fix|refactor|test|chore
```

For example, to suggest adding test cases, the issue name should look like

```
test: add test cases for XXX
```

To file a bug, the issue name should look like

```
fix: XXX is incorrect
```

## Doc String Guide

[jsdoc](https://jsdoc.app/) is used as the standard.
