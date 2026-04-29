const fs = require("fs");
const out = "F:\\Web dev\\Github and Git\\Upload\\MianSnap\\MianSnap\\src\\components\\TrustCard.jsx";
const code = 
import React, { useState, useEffect } from "react"

function ScoreCounter({ target }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let v = 0; const step = Math.max(1, Math.ceil(target / 45))
    const id = setInterval(() => { v = Math.min(v + step, target); setN(v); if (v >= target) clearInterval(id) }, 25)
    return () => clearInterval(id)
  }, [target])
  return React.createElement(React.Fragment, null, n)
}
.trim();
fs.writeFileSync(out, code, "utf8");
console.log("lines:", code.split("\n").length);