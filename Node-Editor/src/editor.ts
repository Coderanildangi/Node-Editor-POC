import { createRoot } from "react-dom/client";
import { NodeEditor, GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions, Area2D } from "rete-area-plugin";
import { ConnectionPlugin, Presets as ConnectionPresets } from "rete-connection-plugin";
import { ReactPlugin, Presets, ReactArea2D } from "rete-react-plugin";
import { ConnectionPathPlugin } from "rete-connection-path-plugin";
import { AutoArrangePlugin, Presets as ArrangePresets, ArrangeAppliers } from "rete-auto-arrange-plugin";
import { ContextMenuExtra, ContextMenuPlugin, Presets as ContextMenuPresets, ContextMenuAreaExtra } from "rete-context-menu-plugin";
import { curveLinear } from "d3-shape";
import store from "./redux/store";


type AreaExtra = ReactArea2D<Schemes> & ContextMenuAreaExtra;

class Connection extends ClassicPreset.Connection<
  ClassicPreset.Node,
  ClassicPreset.Node
> {
  curve?: typeof curveLinear;
}

class Node extends ClassicPreset.Node {
  contextMenu?: ContextMenuExtra;
  height = 100;
  width = 150;

  constructor(socket: ClassicPreset.Socket) {
    super("Dynamic Node");
    this.addInput("input", new ClassicPreset.Input(socket));
    this.addOutput("output", new ClassicPreset.Output(socket));
  }
}

type Schemes = GetSchemes<Node, Connection>;

export async function createEditor(container: HTMLElement) {
  const socket = new ClassicPreset.Socket("socket");
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
  const pathPlugin = new ConnectionPathPlugin<Schemes, Area2D<Schemes>>({
    curve: () => curveLinear,
    arrow: () => true
  });
  const arrange = new AutoArrangePlugin<Schemes>();
  const contextMenu = new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup([
      ["Node", () => new Node(socket)],
    ])
  });

  //render.use(pathPlugin);

  area.use(contextMenu);

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  render.addPreset(Presets.contextMenu.setup());
  render.addPreset(Presets.classic.setup());
  connection.addPreset(ConnectionPresets.classic.setup());
  arrange.addPreset(ArrangePresets.classic.setup());

  editor.use(area);
  area.use(connection);
  area.use(render);
  area.use(arrange);

  await arrange.layout();
  AreaExtensions.zoomAt(area, editor.getNodes());
  // Initialize editor state
  const nodes: ClassicPreset.Node[] = [];

  const createTreeStructure = async (layerCount: number, childNodeCount: number) => {
    // Clear existing nodes and connections
    for (const node of editor.getNodes()) {
      await editor.removeNode(node.id);
    }
  
    for (const connection of editor.getConnections()) {
      await editor.removeConnection(connection.id);
    }
  
    nodes.length = 0;
  
    // Create root node
    const rootNode = new ClassicPreset.Node("Root Node");
    rootNode.addOutput("output", new ClassicPreset.Output(socket));
    await editor.addNode(rootNode);
    await area.translate(rootNode.id, { x: 0, y: 0 });
    nodes.push(rootNode);
  
    // Add child nodes for each layer
    let parentNodes = [rootNode];
    const layerSpacing = 500; // Horizontal spacing between layers
    const nodeSpacing = 550; // Vertical spacing between sibling nodes
  
    for (let layer = 0; layer < layerCount; layer++) {
      const newLayerNodes: ClassicPreset.Node[] = [];
      let childIndex = 0;
  
      for (const parent of parentNodes) {
        const parentView = area.nodeViews.get(parent.id);
        const parentPosition = parentView ? parentView.position : { x: 0, y: 0 };
        const baseX = parentPosition.x + layerSpacing;
        const baseY = parentPosition.y;
  
        for (let i = 0; i < childNodeCount; i++) {
          // Distribute child nodes symmetrically around the parent
          const offsetY = (i - (childNodeCount - 1) / 2) * nodeSpacing;
          const childX = baseX;
          const childY = baseY + offsetY;
  
          const childNode = new ClassicPreset.Node(`Layer ${layer + 1} - Child ${++childIndex}`);
          childNode.addInput("input", new ClassicPreset.Input(socket));
          childNode.addOutput("output", new ClassicPreset.Output(socket));
          await editor.addNode(childNode);
  
          await area.translate(childNode.id, { x: childX, y: childY });
  
          // Connect parent to child
          const connection = new Connection(parent, "output", childNode, "input");
          await editor.addConnection(connection);
  
          newLayerNodes.push(childNode);
        }
      }
  
      parentNodes = newLayerNodes; // Move to the next layer
    }
  
    nodes.push(...parentNodes);
  
    // Adjust zoom to fit all nodes
    setTimeout(() => {
      AreaExtensions.zoomAt(area, editor.getNodes());
    }, 10);
  };
  

  // Watch Redux store for state changes
  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    const { layerCount, childNodeCount } = state.layers;

    //Update tree structure
    createTreeStructure(layerCount, childNodeCount);
  });

  // Initialize tree structure
  const state = store.getState();
  const { layerCount, childNodeCount } = state.layers;
  await createTreeStructure(layerCount, childNodeCount);

  return {
    destroy: () => {
      area.destroy();
      unsubscribe();
    },
  };
}
