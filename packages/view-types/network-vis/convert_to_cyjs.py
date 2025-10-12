import json, sys
from pathlib import Path

def to_cyjs(src):
    cy_nodes = []
    for n in src.get("nodes", []):
        cy_nodes.append({
            "data": {
                "id": n["id"],
                "ftuName": n.get("ftuName"),
                "fileFormat": n.get("fileFormat"),
                "color": n.get("color"),
                "z": n.get("z"),
            },
            "position": {"x": float(n.get("x",0.0)), "y": float(n.get("y",0.0))}
        })
    cy_edges = []
    for e in src.get("links", []):
        eid = e.get("id") or f"{e['source']}__{e['target']}"
        cy_edges.append({"data": {"id": eid, "source": e["source"], "target": e["target"]}})
    return {"data": {}, "elements": {"nodes": cy_nodes, "edges": cy_edges}}

def main():
    if len(sys.argv) < 3:
        print("Usage: python convert_to_cyjs.py <input.json> <output.cyjs>")
        sys.exit(1)
    inp, outp = Path(sys.argv[1]), Path(sys.argv[2])
    src = json.loads(inp.read_text())
    outp.write_text(json.dumps(to_cyjs(src), indent=2))
    print(f"Wrote: {outp.resolve()}")

if __name__ == "__main__":
    main()

