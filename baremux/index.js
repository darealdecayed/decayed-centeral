window.BareMux = {
    BareMuxConnection: function(workerPath) {
        return {
            setTransport: async function(path, config) {
                console.log('BareMux transport set to:', path, config);
                return Promise.resolve();
            }
        };
    }
};
