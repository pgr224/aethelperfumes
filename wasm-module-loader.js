module.exports = function (content) {
  const base64 = content.toString('base64');
  return `
    const base64 = "${base64}";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    module.exports = new WebAssembly.Module(bytes);
  `;
};
module.exports.raw = true;
