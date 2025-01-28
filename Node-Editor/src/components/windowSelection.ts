import { AreaExtensions, BaseAreaPlugin } from 'rete-area-plugin';
import { NodeEditor } from 'rete';

const { selector, accumulateOnCtrl } = AreaExtensions;

export class WindowSelection {
  destroy() {
    throw new Error("Method not implemented.");
  }
  private area: BaseAreaPlugin<any, any>;
  private editor: NodeEditor<any>;
  private selectionBox: HTMLDivElement | null = null;
  private startX: number = 0;
  private startY: number = 0;

  constructor(editor: NodeEditor<any>, area: BaseAreaPlugin<any, any>) {
    this.area = area;
    this.editor = editor;

    this.init();
  }

  private init() {
    const accumulate = accumulateOnCtrl();
    const core = selector<any>();

    this.area.addPipe((context: any) => {
      if (context.type === 'pointerdown') {
        this.startSelection(context.data.event);
      } else if (context.type === 'pointermove') {
        this.updateSelection(context.data.event);
      } else if (context.type === 'pointerup') {
        this.finalizeSelection(core, accumulate.active());
      }
      return context;
    });
  }

  private startSelection(event: PointerEvent) {
    this.startX = event.clientX;
    this.startY = event.clientY;

    this.selectionBox = document.createElement('div');
    this.selectionBox.style.position = 'absolute';
    this.selectionBox.style.border = '2px dashed #999';
    this.selectionBox.style.background = 'rgba(246, 161, 32, 0.2)';
    this.selectionBox.style.pointerEvents = 'none';
    document.body.appendChild(this.selectionBox);
  }

  private updateSelection(event: PointerEvent) {
    if (!this.selectionBox) return;

    const currentX = event.clientX;
    const currentY = event.clientY;

    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);

    this.selectionBox.style.left = Math.min(currentX, this.startX) + 'px';
    this.selectionBox.style.top = Math.min(currentY, this.startY) + 'px';
    this.selectionBox.style.width = width + 'px';
    this.selectionBox.style.height = height + 'px';
  }

  private finalizeSelection(core: ReturnType<typeof selector>, accumulate: boolean) {
    if (!this.selectionBox) return;

    const rect = this.selectionBox.getBoundingClientRect();
    console.log(rect);
    const selectedNodes = this.getNodesInRect(rect);
    console.log(selectedNodes);
    console.debug('Selected nodes:', selectedNodes);

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

    this.selectionBox.remove();
    this.selectionBox = null;
  }

  private getNodesInRect(rect: DOMRect) {
    const nodes = Array.from(this.editor.getNodes()); // Assuming getNodes() returns an iterable of nodes
    console.log(nodes);
    return nodes.filter((node: { id: string }) => {
      const nodeView = this.area.nodeViews.get(node.id);
      console.log(nodeView);
      if (!nodeView) return false;

      const { x, y } = nodeView.position; // Assuming nodeView has a `position` property
      console.log(x, y, rect.left, rect.right, rect.top, rect.bottom);
      return (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      );
    });
  }
}
