# Jupyter-Specta

A JupyterLab extension. (Further description to be added by maintainers)

## Features

- **Custom Document Widget:** Provides a custom widget for viewing and interacting with specific file types within JupyterLab (e.g., `src/document/widget.ts`).
- **Specta Output Rendering:** Implements custom rendering for Specta outputs in cells (e.g., `src/specta_cell_output.ts`).
- **Specta Model Integration:** Likely integrates with a Specta data model for rich data handling (e.g., `src/specta_model.ts`).
- **UI Components:** Includes custom UI components such as icon buttons and potentially layout adjustments (e.g., `src/components/`, `src/layout/`).
- **Top Bar Customization:** Adds elements or functionality to the JupyterLab top bar (e.g., `src/topbar/`).

## Installation

To install the extension, use pip:

```bash
pip install jupyter-specta
```

Then, install the labextension:
```bash
jupyter labextension install jupyter-specta
```

## Usage

(This section should be completed by the project maintainers. Please provide detailed instructions on how to use the `jupyter-specta` extension, including any specific workflows, examples of how to open or interact with Specta files/outputs, and screenshots if applicable.)

## Development

This extension can be built and developed locally.

**Prerequisites:**

- Python >= 3.x
- JupyterLab

**Build Instructions:**

1. Clone the repository:
   ```bash
   git clone https://github.com/trungleduc/specta.git
   cd specta
   ```
2. Install Python dependencies:
   ```bash
   pip install -e .
   ```
3. Build the TypeScript code:
   ```bash
   npm run build:lib
   ```
4. Install the labextension in development mode:
   ```bash
   npm run install:extension
   ```
5. To rebuild the extension automatically as you make changes:
   ```bash
   jupyter lab --watch
   ```

## Contributing

Contributions are welcome! Please refer to the project's issue tracker and pull request guidelines on GitHub. (If a CONTRIBUTING.md file is added, link it here).

## License

This project is licensed under the [MIT License](LICENSE). (Verify that LICENSE file exists and contains the MIT license text).
