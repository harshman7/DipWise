import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RequireAuth from "./RequireAuth";

const mockUseAuth = vi.hoisted(() => vi.fn());

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderProtected(token: string | null, loading: boolean) {
  mockUseAuth.mockReturnValue({
    token,
    loading,
    user: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  });
  return render(
    <MemoryRouter initialEntries={["/secret"]}>
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/secret" element={<div>Secret</div>} />
        </Route>
        <Route path="/login" element={<div>LoginPage</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAuth", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it("navigates to login when unauthenticated", () => {
    renderProtected(null, false);
    expect(screen.getByText("LoginPage")).toBeInTheDocument();
  });

  it("renders nested route when authenticated", () => {
    renderProtected("test-token", false);
    expect(screen.getByText("Secret")).toBeInTheDocument();
  });
});
