/**
 * cn (classname) utility Test Suite
 */

import { cn } from "../cn";

describe("cn utility", () => {
  test("should merge class names", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
  });

  test("should handle conditional classes", () => {
    const isTrue = true;
    const isFalse = false;

    expect(cn("base", isTrue && "visible", isFalse && "hidden")).toBe(
      "base visible",
    );
  });

  test("should handle array inputs", () => {
    expect(cn(["a", "b"])).toBe("a b");
  });

  test("should merge tailwind classes using tailwind-merge (last wins)", () => {
    // p-4 overrides p-2
    expect(cn("p-2", "p-4")).toBe("p-4");
    // text-black overrides text-white
    expect(cn("text-white", "text-black")).toBe("text-black");
  });

  test("should handle undefined and null", () => {
    expect(cn("valid", undefined, null, "also-valid")).toBe("valid also-valid");
  });
});
