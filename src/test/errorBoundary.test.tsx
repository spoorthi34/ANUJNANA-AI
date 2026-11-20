import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Boom = () => {
  throw new Error("stale module graph: React dispatcher is null");
};

afterEach(cleanup);

describe("ErrorBoundary", () => {
  it("renders children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <p>lesson content</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("lesson content")).toBeInTheDocument();
    expect(screen.queryByText("This page needs a refresh")).not.toBeInTheDocument();
  });

  it("shows a reload option instead of a blank screen when a child throws", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("heading", { name: "This page needs a refresh" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reload page/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back to course/i })).toBeInTheDocument();
    spy.mockRestore();
  });
});
