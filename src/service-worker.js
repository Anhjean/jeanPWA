// modified service-worker.js
// this is equivalent to following addEventistener
// self.oninstall = (event) => { };
self.addEventListener("install", event => {
  console.log("[SW.JS] Step 2, Service worker has been installed");
  console.log("Just added something;");
});
// this is equivalent to following addEventistener
// self.onactivate = (event) => { };
self.addEventListener("activate", event => {
  console.log("[SW.JS] Step 3, Service worker has been activated");
});
