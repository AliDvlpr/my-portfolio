import assert from "node:assert/strict";
import test from "node:test";
import { moduleForPath, publicRoutes, routeIsActive } from "../lib/routes";

test("public route registry has unique paths, labels, commands, and modules", () => {
  for (const field of ["href", "label", "command", "module"] as const) {
    const values = publicRoutes.map((route) => route[field]);
    assert.equal(new Set(values).size, values.length);
  }
});

test("route matching handles indexes and detail routes", () => {
  assert.equal(routeIsActive("/", "/"), true);
  assert.equal(routeIsActive("/projects/django-store", "/projects"), true);
  assert.equal(routeIsActive("/blog/post", "/projects"), false);
  assert.equal(moduleForPath("/blog/post"), "engineering-notes");
  assert.equal(moduleForPath("/unknown"), "unregistered");
});
