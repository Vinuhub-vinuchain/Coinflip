import { render, screen } from "@testing-library/react";
import { Coin } from "../src/components/Coin";

describe("Coin", () => {
  it("renders heads when not flipping", () => {
    render(<Coin coinSide="heads" flipping={false} />);
    expect(screen.getByAltText("Heads")).toBeInTheDocument();
  });

  it("applies flipping class when flipping", () => {
    render(<Coin coinSide="heads" flipping={true} />);
    expect(screen.getByRole("img").parentElement).toHaveClass("flipping");
  });
});
