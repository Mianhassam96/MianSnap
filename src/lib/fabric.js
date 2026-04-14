// Fabric.js is loaded via CDN script tag in index.html
// This shim proxies window.fabric so components can use named imports
// without bundling the heavy library through esbuild

export const fabric = new Proxy({}, {
  get(_, prop) {
    return window.fabric?.[prop]
  }
})

export default fabric
