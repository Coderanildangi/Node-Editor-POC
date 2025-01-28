import { AreaExtensions, BaseAreaPlugin as BaseAreaPluginOriginal } from 'rete-area-plugin';

interface BaseAreaPlugin<T extends BaseSchemes, K> extends BaseAreaPluginOriginal<T, K> {
  container: HTMLElement;
}
import { BaseSchemes, NodeEditor } from 'rete';

const { selector, accumulateOnCtrl } = AreaExtensions;

export class LassoSelection {
  private area: BaseAreaPlugin<any, any>;
  private editor: NodeEditor<any>;
  private lassoPath: SVGPathElement | null = null;
  private points: { x: number; y: number }[] = [];

  constructor(editor: NodeEditor<any>, area: BaseAreaPlugin<any, any>) {
    this.area = area;
    this.editor = editor;

    this.init();
  }

  private init() {
    const accumulate = accumulateOnCtrl();
    const core = selector<any>();

    this.area.addPipe((context: any) => {
      console.log('Event:', context.type); // Debugging event types

      if (context.type === 'pointerdown') {
        this.startLasso(context.data.event);
      } else if (context.type === 'pointermove') {
        this.updateLasso(context.data.event);
      } else if (context.type === 'pointerup') {
        this.finalizeLasso(core, accumulate.active());
      }
      return context;
    });
  }

  private startLasso(event: PointerEvent) {
    // Find the editor's SVG layer
    let svg = this.area.container.querySelector('svg');
    if (!svg) {
      console.error('SVG container not found in the editor. Checking DOM structure...');
      console.log('Area container:', this.area.container);
      
      // Attempt to create an SVG element dynamically as a fallback
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.position = 'absolute';
      svg.style.top = '0';
      svg.style.left = '0';
      svg.style.width = '100%';
      svg.style.height = '100%';
      this.area.container.appendChild(svg);
    }
  
    // Create the lasso path
    this.lassoPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.lassoPath.setAttribute('fill', 'rgba(99, 241, 102, 0.2)');
    this.lassoPath.setAttribute('stroke', '#999');
    this.lassoPath.style.border = '1px dashed #999';
    this.lassoPath.setAttribute('stroke-width', '2');
    this.lassoPath.setAttribute('pointer-events', 'none');
    svg.appendChild(this.lassoPath);
  
    // Initialize points for the lasso
    this.points = [{ x: event.clientX, y: event.clientY }];
    this.updateLassoPath();
  }
  
  private updateLasso(event: PointerEvent) {
    if (!this.lassoPath) return;

    this.points.push({ x: event.clientX, y: event.clientY });
    this.updateLassoPath();
  }

  private updateLassoPath() {
    if (!this.lassoPath || this.points.length === 0) return;

    const pathData =
      this.points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ') + ' Z';

    console.log('Lasso Path Data:', pathData); // Debugging path data
    this.lassoPath.setAttribute('d', pathData);
  }

  private finalizeLasso(core: ReturnType<typeof selector>, accumulate: boolean) {
    if (!this.lassoPath) return;

    const lassoPolygon = new Path2D(this.lassoPath.getAttribute('d')!);

    const selectedNodes = this.getNodesInLasso(lassoPolygon);
    selectedNodes.forEach((node: { id: any }) =>
      core.add(
        {
          label: 'node',
          id: node.id,
          translate: () => {},
          unselect: () => {},
        },
        accumulate
      )
    );

    // Clean up lasso path
    this.lassoPath.remove();
    this.lassoPath = null;
    this.points = [];
  }

  private getNodesInLasso(lassoPolygon: Path2D) {
    const nodes = Array.from(this.editor.getNodes()); // Assuming getNodes() returns an iterable of nodes

    return nodes.filter((node: { id: string }) => {
      const nodeView = this.area.nodeViews.get(node.id);
      if (!nodeView) return false;

      const { x, y } = nodeView.position; // Assuming nodeView has a `position` property
      const ctx = document.createElement('canvas').getContext('2d');
      if (!ctx) return false;
      return ctx.isPointInPath(lassoPolygon, x, y);
    });
  }

  // Uncomment and implement if you want connection selection as well
  // private getConnectionsInLasso(lassoPolygon: Path2D) {
  //   const connections = Array.from(this.editor.getConnections());
  //   return connections.filter((conn: { id: string }) => {
  //     const connView = this.area.connectionViews.get(conn.id);
  //     if (!connView) return false;

  //     const { source, target } = connView.position; // Adjust based on actual API
  //     return (
  //       lassoPolygon.isPointInPath(source.x, source.y) ||
  //       lassoPolygon.isPointInPath(target.x, target.y)
  //     );
  //   });
  // }
}
