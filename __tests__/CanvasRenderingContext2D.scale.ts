import { instantiateBuffer, ICanvasSYS } from "../src";
import { readFileSync } from "fs";
import { ASUtil } from "assemblyscript/lib/loader";
import { IDrawFunctionsTestSuite } from "./__setup__/DrawFunctionsTestSuite";

let buff = readFileSync("./build/draw-functions.test.wasm");
let wasm: ASUtil & ICanvasSYS & IDrawFunctionsTestSuite;
let ctx: CanvasRenderingContext2D;

type ScaleArgs = [number, number];

beforeEach(() => {
  wasm = instantiateBuffer<IDrawFunctionsTestSuite>(buff, {
    test: {
      log: console.log.bind(console),
      logStr(ptr: number) {
        console.log(wasm.__getString(ptr));
      },
    }
  });
  var canvas: HTMLCanvasElement = document.createElement("canvas");
  ctx = canvas.getContext("2d")!;
  wasm.useContext("main", ctx);
  wasm.init();
});


describe("scale", () => {
  it("should call setTransform", () => {
    wasm.scale(2, 3);
    wasm.arc(1, 2, 3, 4, 5);
    wasm.fill();
    wasm.commit();
    expect(ctx.setTransform).toBeCalled();
  });
  var finiteTests: ScaleArgs[] = [
    [NaN, 1],
    [1, NaN],
    [Infinity, 1],
    [1, Infinity],
    [-Infinity, 1],
    [1, -Infinity],
  ];

  finiteTests.forEach(e => {
    it("should not scale when value is" + e, () => {
      wasm.scale(...e);
      wasm.arc(1, 2, 3, 4, 5);
      wasm.fill();
      wasm.commit();
      expect(ctx.setTransform).not.toBeCalled();
    });
  });

  it("should actually scale the context", () => {
    var tmp = document.createElement("canvas").getContext("2d")!;
    tmp.scale(2, 3);
    var expected = tmp.getTransform();

    wasm.scale(2, 3);
    wasm.arc(1, 2, 3, 4, 5);
    wasm.fill();
    wasm.commit();
    expect(ctx.getTransform()).toStrictEqual(expected);
  });
});