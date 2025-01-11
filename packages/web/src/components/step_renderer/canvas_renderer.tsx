import { Box } from "@chakra-ui/react";
import { Steps, Step, GameFactory } from "@web/interfaces";
import { useEffect, useRef } from "react";
import Konva from "konva";
import { stepEvents } from "./events";
import { store } from "@web/store";

let __konvaInitialized = false;
let stageContainer: HTMLDivElement | null = null;
let stage: Konva.Stage | null = null;
let contentsLayer: Konva.Layer | null = null;
let scrollLayer: Konva.Layer | null = null;
const WIDTH = 10000;
const HEIGHT = 10000;
const PADDING = 5;
const commonNodeOpt: Partial<MakeNodeOptions> = {
  width: 300,
  height: 120,
  padding: 5,
  spacing: 100,
};
const nodeHSpacing = 200;
const nodeBoxHeight = commonNodeOpt.height! + commonNodeOpt.spacing!;
const ORIGIN_POINT = {
  x: -(2000 + commonNodeOpt.width! / 2),
  y: -2000,
};

const drawNodes = (steps: Steps) => {
  if (!stage) {
    console.error("No stage");
    return;
  }
  if (!contentsLayer) {
    console.error("No contents layer");
    return;
  }

  const stepsList = steps.toLists();

  const conditionHeadNodes: {
    idx: number;
    node: ReturnType<typeof makeNode>;
  }[] = [];

  const firstList = stepsList.shift();
  if (!firstList) {
    console.error("No first list");
    return;
  }
  if (!firstList.list) {
    console.error("No first list list");
    return;
  }
  const firstListNodes = firstList.list.map((step, idx) =>
    makeNode(step, idx, { x: WIDTH / 2, y: HEIGHT / 2, ...commonNodeOpt }),
  );

  const needDrawNodes = [firstListNodes];
  stepsList.forEach((stepList, listIdx) => {
    if (!stepList.list) {
      const mockNode = makeNode(
        GameFactory.step({
          id: Date.now(),
          state: stepList.prevStep!.state,
        }),
        0,
        {
          x:
            WIDTH / 2 +
            (commonNodeOpt.width! + PADDING + nodeHSpacing) * (listIdx + 1),
          y: HEIGHT / 2 + nodeBoxHeight * stepList.idx,
          ...commonNodeOpt,
        },
      );
      // 吃坑直接停牌的时候把上一个场的state重新复制给新的step
      needDrawNodes.push([mockNode]);
      conditionHeadNodes.push({
        idx: stepList.idx,
        node: mockNode,
      });
      return;
    }

    const nodes = stepList.list.map((step, nodeIdx) => {
      return makeNode(step, nodeIdx, {
        x:
          WIDTH / 2 +
          (commonNodeOpt.width! + PADDING + nodeHSpacing) * (listIdx + 1),
        y: HEIGHT / 2 + nodeBoxHeight * stepList.idx,
        ...commonNodeOpt,
      });
    });
    needDrawNodes.push(nodes);
    conditionHeadNodes.push({
      idx: stepList.idx,
      node: nodes[0],
    });
  });

  // draw lines from firstList[0] to condition head nodes
  for (let i = 0; i < conditionHeadNodes.length; i++) {
    const conditionHeadNode = conditionHeadNodes[i];
    const parentNode = firstListNodes[conditionHeadNode.idx];
    let points: number[] = [];
    if (i === 0) {
      points = [
        parentNode.getBoundedBox().x + parentNode.getBoundedBox().width,
        parentNode.getBoundedBox().y + parentNode.getBoundedBox().height / 2,

        conditionHeadNode.node.getBoundedBox().x,
        conditionHeadNode.node.getBoundedBox().y +
          conditionHeadNode.node.getBoundedBox().height / 2,
      ];
    } else {
      points = [
        parentNode.getBoundedBox().x + parentNode.getBoundedBox().width,
        parentNode.getBoundedBox().y + parentNode.getBoundedBox().height / 2,

        parentNode.getBoundedBox().x + parentNode.getBoundedBox().width + 50,
        parentNode.getBoundedBox().y + parentNode.getBoundedBox().height / 2,

        parentNode.getBoundedBox().x + parentNode.getBoundedBox().width + 50,
        parentNode.getBoundedBox().y +
          parentNode.getBoundedBox().height / 2 -
          commonNodeOpt.height! / 2 -
          20,

        conditionHeadNode.node.getBoundedBox().x - nodeHSpacing + 50,
        parentNode.getBoundedBox().y +
          parentNode.getBoundedBox().height / 2 -
          commonNodeOpt.height! / 2 -
          20,

        conditionHeadNode.node.getBoundedBox().x - nodeHSpacing + 50,
        conditionHeadNode.node.getBoundedBox().y +
          conditionHeadNode.node.getBoundedBox().height / 2,

        conditionHeadNode.node.getBoundedBox().x,
        conditionHeadNode.node.getBoundedBox().y +
          conditionHeadNode.node.getBoundedBox().height / 2,
      ];
    }
    const line = new Konva.Arrow({
      points,
      fill: "black",
      stroke: "black",
    });
    const conditionText = new Konva.Text({
      text: steps.getFlatConditions()[i].condition,
      x:
        i === 0
          ? parentNode.getBoundedBox().x +
            (parentNode.getBoundedBox().width + nodeHSpacing / 2)
          : conditionHeadNode.node.group.x(),
      y: parentNode.getBoundedBox().y + parentNode.getBoundedBox().height / 2,
    });
    if (i === 0) {
      conditionText.offsetX(conditionText.width() / 2);
    } else {
      conditionText.offsetX(conditionText.width() + 20);
    }
    conditionText.offsetY(conditionText.height() + 5);

    contentsLayer.add(line);
    contentsLayer.add(conditionText);
  }

  // draw nodes
  for (const nodes of needDrawNodes) {
    for (const node of nodes) {
      contentsLayer.add(node.group);
    }
  }
};

export const StepRenderer: React.FC<{
  steps?: Steps;
}> = ({ steps }) => {
  const konvaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!__konvaInitialized) return;
    if (!steps) return;

    contentsLayer!.destroyChildren();
    drawNodes(steps);
  }, [steps]);

  useEffect(() => {
    if (!konvaContainerRef.current) {
      console.error("No konva container found");
      return;
    }
    stageContainer = konvaContainerRef.current;
    stage = new Konva.Stage({
      container: konvaContainerRef.current!,
      width: window.innerWidth - 10 * 2,
      height: window.innerHeight - 10 * 2,
    });
    contentsLayer = new Konva.Layer();

    // move to origin point
    contentsLayer.position(ORIGIN_POINT);
    stage.add(contentsLayer);

    scrollLayer = new Konva.Layer();
    const verticalBar = new Konva.Rect({
      width: 5,
      height: 100,
      cornerRadius: 10,
      fill: "grey",
      opacity: 0.8,
      x: stage.width() - PADDING,
      y: PADDING,
      draggable: true,
      dragBoundFunc: function (pos) {
        pos.x = stage!.width() - PADDING - 10;
        pos.y = Math.max(
          Math.min(pos.y, stage!.height() - this.height() - PADDING),
          PADDING,
        );
        return pos;
      },
    });
    verticalBar.on("dragmove", function () {
      // delta in %
      const availableHeight =
        stage!.height() - PADDING * 2 - verticalBar.height();
      var delta = (verticalBar.y() - PADDING) / availableHeight;

      contentsLayer!.y(-(HEIGHT - stage!.height()) * delta);
    });

    const horizontalBar = new Konva.Rect({
      width: 100,
      height: 5,
      cornerRadius: 10,
      fill: "grey",
      opacity: 0.8,
      x: PADDING,
      y: stage.height() - PADDING,
      draggable: true,
      dragBoundFunc: function (pos) {
        pos.x = Math.max(
          Math.min(pos.x, stage!.width() - this.width() - PADDING),
          PADDING,
        );
        pos.y = stage!.height() - PADDING - 10;

        return pos;
      },
    });
    horizontalBar.on("dragmove", function () {
      // delta in %
      const availableWidth =
        stage!.width() - PADDING * 2 - horizontalBar.width();
      var delta = (horizontalBar.x() - PADDING) / availableWidth;

      contentsLayer!.x(-(WIDTH - stage!.width()) * delta);
    });

    scrollLayer.add(verticalBar);
    scrollLayer.add(horizontalBar);
    stage.add(scrollLayer);

    stage.on("wheel", (e) => {
      e.evt.preventDefault();
      if (e.evt.ctrlKey) {
        // zoom
        const scaleBy = 1.05; // 缩放比例
        const oldScale = contentsLayer!.scaleX(); // 假设x和y方向缩放相同
        const pointer = stage!.getPointerPosition();
        if (!pointer) {
          console.log("Konva Stage no pointer");
          return;
        }

        const mousePointTo = {
          x: (pointer.x - contentsLayer!.x()) / oldScale,
          y: (pointer.y - contentsLayer!.y()) / oldScale,
        };

        // 根据滚轮方向调整缩放
        const newScale =
          e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

        contentsLayer!.scale({ x: newScale, y: newScale });

        // 调整contentLayer的位置，确保缩放点保持在鼠标位置
        const newPos = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        };
        contentsLayer!.position(newPos);

        contentsLayer!.batchDraw(); // 只重绘这个Layer
      } else {
        // pan
        const dx = e.evt.deltaX;
        const dy = e.evt.deltaY;

        const minX = -(WIDTH - stage!.width());
        const maxX = 0;

        const x = Math.max(minX, Math.min(contentsLayer!.x() - dx, maxX));

        const minY = -(HEIGHT - stage!.height());
        const maxY = 0;

        const y = Math.max(minY, Math.min(contentsLayer!.y() - dy, maxY));
        contentsLayer!.position({ x, y });

        const availableHeight =
          stage!.height() - PADDING * 2 - verticalBar.height();
        const vy =
          (contentsLayer!.y() / (-HEIGHT + stage!.height())) * availableHeight +
          PADDING;

        const availableWidth =
          stage!.width() - PADDING * 2 - horizontalBar.width();

        const hx =
          (contentsLayer!.x() / (-WIDTH + stage!.width())) * availableWidth +
          PADDING;

        verticalBar.y(vy);
        horizontalBar.x(hx);
      }
    });

    const handleRedraw = () => {
      contentsLayer!.destroyChildren();
      const steps = store.getCurrentSteps();
      if (steps) {
        drawNodes(steps);
      }
    };
    stepEvents.on("add-step-done", handleRedraw);
    stepEvents.on("add-condition-done", handleRedraw);
    stepEvents.on("edit-step-done", handleRedraw);

    __konvaInitialized = true;
  }, []);

  return <Box id="konva-container" ref={konvaContainerRef}></Box>;
};

type MakeNodeOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  padding: number;
  spacing: number;
};
const makeNode = (
  step: Step,
  idx: number,
  opt: Partial<MakeNodeOptions> = {},
) => {
  const id = Date.now();
  const x = opt.x || 10;
  const y = opt.y || 10;
  const width = opt.width || 300;
  const height = opt.height || 120;
  const padding = opt.padding || 5;
  const spacing = opt.spacing || 100;

  const group = new Konva.Group({
    id: id.toString(),
    // draggable: true,
    x,
    y: idx ? idx * (height + spacing) + y : y,
    width,
    height,
  });

  // contents
  const border = new Konva.Rect({
    stroke: "black",
    strokeWidth: 1,
    width,
    height,
    cornerRadius: 5,
  });
  const bg = new Konva.Rect({
    fill: "white",
    width,
    height,
    cornerRadius: 5,
  });

  const stateText = [];
  const stateTextList = makeStateTextList(step.state);
  for (let i = 0; i < stateTextList.length; i++) {
    const text = stateTextList[i];
    stateText.push(
      new Konva.Text({
        text,
        x: padding,
        y: i === 0 ? padding : i * 20 + padding,
        width: width - padding * 2,
      }),
    );
  }

  const arrowDown = new Konva.Arrow({
    points: [width / 2, height, width / 2, height + spacing - padding],
    pointerLength: 10,
    pointerWidth: 10,
    fill: "black",
    stroke: "black",
  });
  const nextStepAction = new Konva.Text({
    text: step.nextStepAction,
    x: width / 2 + padding,
    y: height + spacing / 2 + padding,
    width: width - padding * 2,
  });
  nextStepAction.offsetY(nextStepAction.height());

  const circlePlusSvgPath =
    "m12.002 2c5.518 0 9.998 4.48 9.998 9.998 0 5.517-4.48 9.997-9.998 9.997-5.517 0-9.997-4.48-9.997-9.997 0-5.518 4.48-9.998 9.997-9.998zm-.747 9.25h-3.5c-.414 0-.75.336-.75.75s.336.75.75.75h3.5v3.5c0 .414.336.75.75.75s.75-.336.75-.75v-3.5h3.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-3.5v-3.5c0-.414-.336-.75-.75-.75s-.75.336-.75.75z";

  const addStepBtn = makeSvgBtn(circlePlusSvgPath, {
    x: width / 2,
    y: height,
    width: 25,
    height: 25,
    iconScale: { x: 0.8, y: 0.8 },
    iconX: 2.5,
    iconY: 2.5,
  });
  addStepBtn.offsetX(addStepBtn.width() / 2);
  addStepBtn.offsetY(addStepBtn.height() / 2);
  addStepBtn.hide();
  addStepBtn.on("click", () => {
    stepEvents.emit("req-add-step", step);
  });

  const addConditionBtn = makeSvgBtn(circlePlusSvgPath, {
    x: width,
    y: height / 2,
    width: 25,
    height: 25,
    iconScale: { x: 0.8, y: 0.8 },
    iconX: 2.5,
    iconY: 2.5,
  });
  addConditionBtn.offsetX(addConditionBtn.width() / 2);
  addConditionBtn.offsetY(addConditionBtn.height() / 2);
  addConditionBtn.hide();
  addConditionBtn.on("click", () => {
    stepEvents.emit("req-add-condition", step);
  });

  group.on("mouseenter", () => {
    addStepBtn.show();
    addConditionBtn.show();
  });
  group.on("mouseleave", () => {
    addStepBtn.hide();
    addConditionBtn.hide();
  });

  group.add(bg);
  group.add(arrowDown);
  group.add(border);
  stateText.forEach((text) => group.add(text));
  group.add(nextStepAction);
  group.add(addStepBtn);
  group.add(addConditionBtn);
  group.on("dblclick", () => {
    stepEvents.emit("req-edit-step", step);
  });

  if (!step.nextStepId) {
    const stopText = new Konva.Text({
      text: "停牌",
      x: width / 2,
      y: height + spacing,
    });
    stopText.offsetX(stopText.width() / 2);
    group.add(stopText);
  }

  return {
    step,
    group,
    getBoundedBox: () => {
      return {
        x: group.x(),
        y: group.y(),
        width,
        height,
      };
    },
  };
};

const makeStateTextList = (state: Step["state"]) => {
  const exLeft = state.field.exLeft ? state.field.exLeft : "";
  const exRight = state.field.exRight ? state.field.exRight : "";
  const front = state.field.front;
  const back = state.field.back;
  const graveyard = state.graveyard;
  const hand = state.hand;
  const banished = state.banished;

  return [
    `左额外: ${exLeft}    右额外: ${exRight}`,
    `前场: ${front}`,
    `后场: ${back}`,
    `墓地: ${graveyard}`,
    `手牌: ${hand}`,
    `除外: ${banished}`,
  ];
};

type SvgBtnOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadius: number;
  backgroundColor: string;
  iconScale: { x: number; y: number };
  iconFill: string;
  iconX: number;
  iconY: number;
};
const makeSvgBtn = (path: string, opt: Partial<SvgBtnOptions> = {}) => {
  const width = opt.width || 30;
  const height = opt.height || 30;
  const cornerRadius = opt.cornerRadius || 5;

  const group = new Konva.Group({
    x: opt.x || 0,
    y: opt.y || 0,
    width,
    height,
  });

  const bg = new Konva.Rect({
    x: 0,
    y: 0,
    width,
    height,
    cornerRadius,
    fill: opt.backgroundColor || "black",
  });
  const icon = new Konva.Path({
    x: opt.iconX || 0,
    y: opt.iconY || 0,
    data: path,
    fill: opt.iconFill || "white",
    scale: opt.iconScale,
  });

  group.add(bg);
  group.add(icon);
  group.on("mouseenter", () => {
    if (!stageContainer) return;
    stageContainer.style.cursor = "pointer";
  });
  group.on("mouseleave", () => {
    if (!stageContainer) return;
    stageContainer.style.cursor = "default";
  });

  return group;
};
