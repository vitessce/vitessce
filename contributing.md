# Contributing to Vitessce

Thank you for your interest in contributing to Vitessce! We welcome contributions from the community and are excited to collaborate with you. Please follow the guidelines below to ensure a smooth contribution process.

---

## Issues and Bug Reporting
If you encounter a bug, briefly search the [existing issues](https://github.com/vitessce/vitessce/issues) to see if it has already been reported. If not, create a new issue with the following details:
1. A clear title summarizing the problem.
2. Steps to reproduce the issue.
3. Expected and actual behavior.
4. Any relevant logs, screenshots, or environment details.
5. If relevant to a cell atlasing effort or consortium, feel free to mention this so that we are aware of the context.

---

## How to Contribute

### 1. Fork the Repository
Start by forking the repository to your GitHub account. You can do this by clicking the **Fork** button at the top right of the [Vitessce repository](https://github.com/vitessce/vitessce).

### 2. Clone Your Fork
Clone your fork to your local machine:
```bash
git clone https://github.com/your-username/vitessce.git
```

### 3. Create a New Branch
Create a new branch for your feature or bugfix. Use a descriptive name for the branch, such as:
```bash
git checkout -b user/my-new-feature
```

Please use one of the following naming conventions for new branches:
- `{github-username}/{feature-name}`
- `{github-username}/fix-{issue-num}`


### 4. Make Your Changes
Make your changes in the codebase. Ensure that your code adheres to the project’s coding [style and conventions](./dev-docs/design-guidelines.md). If you’re adding new features, consider including tests and documentation updates.

#### Development Guidelines
For detailed information about setting up the development environment, please refer to the [Development](README.md#development) section in the README.

### 5. Run Tests
Before submitting your changes, run the existing tests following the [testing guidelines](README.md#testing) to ensure your changes don’t break anything.

If applicable, write new tests for the functionality you’ve added or modified.

### 6. Commit Your Changes
Commit your changes with a clear and concise message:
```bash
git commit -m "Fix: Resolve issue with rendering component"
```

### 7. Push Your Changes
Push your branch to your forked repository:
```bash
git push origin user/my-new-feature
```

### 8. Open a Pull Request
Go to the [Vitessce repository](https://github.com/vitessce/vitessce) and open a pull request from your branch. Be sure to include:
- A descriptive title and summary of your changes.
- Links to any relevant issues.
- Any special instructions for reviewers.


If you have any questions or need help, feel free to open an issue.
