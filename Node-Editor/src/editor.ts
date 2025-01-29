import { createRoot } from "react-dom/client";
import { NodeEditor, GetSchemes, ClassicPreset } from "rete";
import { AreaPlugin, AreaExtensions, Area2D } from "rete-area-plugin";
import { ConnectionPlugin, Presets as ConnectionPresets } from "rete-connection-plugin";
import { ReactPlugin, Presets, ReactArea2D } from "rete-react-plugin";
import { ConnectionPathPlugin } from "rete-connection-path-plugin";
import { AutoArrangePlugin, Presets as ArrangePresets, ArrangeAppliers } from "rete-auto-arrange-plugin";
import { ContextMenuExtra, ContextMenuPlugin, Presets as ContextMenuPresets } from "rete-context-menu-plugin";
import { curveLinear } from "d3-shape";
import store from "./redux/store";
import { WindowSelection } from "./components/windowSelection";
import { easeInOut } from "popmotion";
import { LassoSelection } from "./components/lassoSelection";
import jsonData from "./data/data.json";


type AreaExtra = ReactArea2D<Schemes>;

class Connection extends ClassicPreset.Connection<
  ClassicPreset.Node,
  ClassicPreset.Node
> {
  curve?: typeof curveLinear;
  from: any;
  to: any;
}

const socket = new ClassicPreset.Socket("socket");

class Node extends ClassicPreset.Node {
  contextMenu?: ContextMenuExtra;
  height = 100;
  width = 150;

  constructor(label = "Dynamic Node") {
    super(label);
    this.addInput("port", new ClassicPreset.Input(socket));
    this.addOutput("port", new ClassicPreset.Output(socket));
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
      ["Node", () => new Node()],
    ])
  });

  area.use(contextMenu as any);
  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  render.addPreset(Presets.contextMenu.setup() as any);
  render.addPreset(Presets.classic.setup());
  connection.addPreset(ConnectionPresets.classic.setup());
  arrange.addPreset(ArrangePresets.classic.setup());

  editor.use(area);
  area.use(connection);
  area.use(render);
  area.use(arrange);

  const animatedApplier = new ArrangeAppliers.TransitionApplier<Schemes, never>({
    duration: 500,
    timingFunction: easeInOut
 });

  // Initialize selection tools
  const windowSelection = new WindowSelection(editor, area);

  

  async function addNodesFromJSON(data: { [x: string]: any }, parentNode: Node | null = null, posX = 0, posY = 0, layerCount: number, currentLayer = 1) {
    // Stop recursion if currentLayer exceeds layerCount
    if (currentLayer > layerCount) return;
  
    for (const key in data) {
      const childData = data[key];
      const node = new Node(key);
      await editor.addNode(node);
      await area.translate(node.id, { x: posX, y: posY });
  
      // If parentNode exists, create a connection to it
      if (parentNode) {
        const connection = new Connection(parentNode, "port", node, "port");
        await editor.addConnection(connection);
      }
  
      // If childData is an array, process its items
      if (Array.isArray(childData)) {
        let childX = posX - ((childData.length - 1) * 200) / 2;
        for (const item of childData) {
          const childNode = new Node(item);
          await editor.addNode(childNode);
          await area.translate(childNode.id, { x: childX, y: posY + 300 }); // Horizontal arrangement, slight Y offset
          await editor.addConnection(new Connection(node, "port", childNode, "port"));
          childX += 200; // Update horizontal position for next sibling
        }
      } else if (typeof childData === "object" && childData !== null) {
        let childX = posX - (Object.keys(childData).length - 1) * 200 / 2;
        for (const subKey in childData) {
          // Recursive call, increasing the layer depth
          await addNodesFromJSON({ [subKey]: childData[subKey] }, node, childX, posY + 300, layerCount, currentLayer + 1);
          childX += 200; // Update horizontal position for next child
        }
      }
  
      posX += 300; // Move horizontally for next node
    }
  }

  // Watch Redux store for state changes
  const unsubscribe = store.subscribe(async () => {
    const state = store.getState();
    const { layerCount } = state.layers;

     // Clear existing nodes and connections
     for (const node of editor.getNodes()) {
      await editor.removeNode(node.id);
    }
  
    for (const connection of editor.getConnections()) {
      await editor.removeConnection(connection.id);
    }
//
    addNodesFromJSON(jsonData, null, 0, 0, layerCount);

    // Adjust zoom to fit all nodes
    setTimeout(() => {
      AreaExtensions.zoomAt(area, editor.getNodes());
    }, 10);
  });

  // Initialize tree structure
  const state = store.getState();
  const { layerCount } = state.layers;

  // Use the `addNodesFromJSON` function to create nodes from JSON data
  await addNodesFromJSON(jsonData, null, 0, 0, layerCount);

  await arrange.layout({ applier: animatedApplier });
  AreaExtensions.zoomAt(area, editor.getNodes());

  return {
    destroy: () => {
      area.destroy();
      unsubscribe();
    }
  };
}

