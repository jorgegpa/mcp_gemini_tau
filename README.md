# QA MCP Testing

Test Automation con Vitest, Allure y Agentes Gemini vía MCP

## Prerequisites

*   Node.js (v18 or higher)
*   npm

## Installation

1.  Clone the repository.
2.  Install the dependencies:

    ```bash
    npm install
    ```

## Configuration

This project uses a `.env` file to manage environment variables. You will need to create a `.env` file in the root of the project and add your Gemini API Key.

1.  Create a `.env` file in the root of the project:

    ```bash
    touch .env
    ```

2.  Add your Gemini API key to the `.env` file:

    ```
    GEMINI_API_KEY=your_api_key_here
    ```

## Running the Agent

To run the Gemini agent, use the following command:

```bash
npm run agent:run
```

This will execute the `src/agent/gemini-client.ts` script.

## Running the Tests

To run the tests, use the following command:

```bash
npm test
```

This will run the Vitest tests.

## Allure Reports

This project uses Allure for test reporting.

### Generate the report

To generate the Allure report, run the following command after executing the tests:

```bash
npm run allure:generate
```

This will create an `allure-report` directory with the test results.

### View the report

To view the Allure report, run the following command:

```bash
npm run allure:open
```

This will open the report in your default web browser.

### Clear results

To clear the `allure-results` and `allure-report` directories, run:

```bash
npm run allure:clear
```
