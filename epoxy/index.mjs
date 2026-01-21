export default class EpoxyTransport {
  constructor(config) {
    this.config = config;
  }
  
  async fetch(url, options) {
    return fetch(url, options);
  }
}
