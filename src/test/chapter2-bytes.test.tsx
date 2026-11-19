import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ByteEncodingLab } from "@/components/lessons/chapter2/ByteEncodingLab";

const click = (name: string) => fireEvent.click(screen.getByRole("button", { name }));

describe("Tutorial dai caratteri ai byte", () => {
  it("separa caratteri e byte UTF-8 e converte un blocco Base64 con riempimento", () => {
    render(<ByteEncodingLab />);
    click("Carattere 5: è");
    const sequence = within(screen.getByRole("group", { name: "Sequenza UTF-8 del messaggio" }));
    expect(sequence.getByText("C3", { exact: true })).toHaveAttribute("data-selected", "true");
    expect(sequence.getByText("A8", { exact: true })).toHaveAttribute("data-selected", "true");

    click("Leggi un byte in hex");
    click("Byte 4: 66");
    expect(screen.getAllByText("0110", { exact: true })).toHaveLength(2);
    click("Raggruppa in Base64");
    click("A");
    expect(screen.getByText(/Blocco codificato/)).toHaveTextContent("QQ==");
    expect(screen.getAllByText("QQ==")).toHaveLength(2);
  });

  it("ritrova il byte originale applicando due volte la maschera scelta", () => {
    render(<ByteEncodingLab />);
    fireEvent.change(screen.getByLabelText("Messaggio"), { target: { value: "" } });
    expect(screen.getByRole("button", { name: "Leggi un byte in hex" })).toBeDisabled();
    click("A");

    click("Leggi un byte in hex");
    click("Raggruppa in Base64");
    click("Prova XOR sui bit");
    click("Bit 1 della maschera");
    click("Applica XOR");
    expect(within(screen.getByRole("status")).getByText("Primo XOR · 64")).toBeVisible();
    click("Applica la stessa maschera");
    expect(screen.getByText("Secondo XOR · 41")).toBeVisible();
  });
});
