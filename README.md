# Node Editor

This POC implements a Node Editor using Rete.js with React. It provides a dynamic and interactive visual interface to create and manage nodes connected in a tree-like structure. The editor supports functionality such as auto-arrangement, context menus, zooming, and panning, along with horizontal and symmetric node layouts.

## Features

- Dynamic Node Creation: Nodes can be added dynamically through a context menu.
- Auto-Arrangement: Nodes are automatically positioned to maintain a clean and readable structure.
- Horizontal Layout: Nodes branch out horizontally from the root node.
- Symmetry: Child nodes are symmetrically placed above and below their parent.
- Zoom and Pan: Supports zooming and panning for better navigation.
- Context Menu: Right-click to add new nodes.
- Redux Integration: Monitors state changes in a Redux store and dynamically updates the node tree.

## Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd <repository-folder>
```

2. **Go to POC:**

```bash
cd Node-Editor
```

3. **Install dependencies:**

```bash
npm install
```

4. **Start the development server:**

```bash
npm run dev
```

## Usage

### Initialize the Node Editor

To use the node editor, call the createEditor(container: HTMLElement) function and provide a DOM container element where the editor will render.

### Dynamic Tree Generation

The node editor supports generating a tree structure dynamically based on the Redux state:

- layerCount: Number of layers in the tree.
- childNodeCount: Number of child nodes per parent node.

### Example Redux State
```js
{
  layers: {
    layerCount: 3,
    childNodeCount: 2
  }
}
```
### Symmetric Layout

Child nodes are symmetrically positioned around their parent node for better visual clarity.

## Technologies Used:

1. **Rete.js:**
Core framework for node-based editors.

2. **React.js:**
UI library for rendering and managing components.

3. **Redus:**
State management library for application-wide state handling.

4. **Rete Plugins used:**
- ***Rete-Area-Plugin:*** For zooming, panning, and node positioning.
- ***Rete-React-Plugin:*** Renders nodes using React.
- ***Rete-Connection-Plugin:*** Manages connections between nodes.
- ***Rete-Connection-Path-Plugin:*** Customizes connection paths with d3-shape curves.
- ***Rete-Auto-Arrange-Plugin:*** Automatically arranges nodes.
- ***Rete-Context-Menu-Plugin:*** Adds a context menu for node creation.

## Project Structure

```sh
.
├── src
│   ├── components
│   │   └── toolbar.js     # Main Node Editor component
│   ├── redux
│   │   ├── store.js          # Redux store configuration
│   │   └── slices
│   │       └── layersSlice.js # Redux slice for managing layers
│   └── utils
│       ├── createEditor.js   # Function to initialize the editor
│       └── layoutHelpers.js  # Utilities for symmetric and horizontal layouts
├── public
│   └── index.html            # Main HTML file
├── package.json
└── README.md
```

## License

This project is open-source and available under the MIT License.

## Author

dev-anil