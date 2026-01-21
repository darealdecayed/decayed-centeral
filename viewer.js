const CONFIG = {
	files: {
		wasm: "/scram/scramjet.wasm.wasm",
		all: "/scram/scramjet.all.js",
		sync: "/scram/scramjet.sync.js",
	},
	transport: {
		path: "/epoxy/index.mjs",
		wsp: "wss://gointospace.app/wisp/",
	},
	bareurl: `${location.protocol === "https:" ? "https" : "http"}://${location.host}/bare/`,
	defaults: {
		url: "https://start.duckduckgo.com/",
		newpage: "/page/newtab.html",
		serp: "https://search.brave.com/search?q=",
	},
	ui: {
		favicon: "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=",
		sjlogo: "/assets/scramjet.png",
		quickIconSize: 2048,
	},
};

let scramjet;
let connection;

async function initializeProxy() {
	try {
		const { ScramjetController } = $scramjetLoadController();
		scramjet = new ScramjetController({
			files: CONFIG.files,
			prefix: "/scramjet/"
		});
		await scramjet.init();

		navigator.serviceWorker.register("./sw.js");

		connection = new BareMux.BareMuxConnection("/baremux/worker.js");
		await connection.setTransport(CONFIG.transport.path, [
			{
				wisp: CONFIG.transport.wsp,
			},
		]);

		console.log("Proxy initialized successfully");
	} catch (error) {
		console.error("Failed to initialize proxy:", error);
	}
}

function navigateToUrl(url) {
	if (!scramjet) {
		console.error("Proxy not initialized");
		return;
	}

	let processedUrl = url.trim();
	
	if (!processedUrl.startsWith("http") && !processedUrl.includes(".")) {
		processedUrl = CONFIG.defaults.serp + encodeURIComponent(processedUrl);
	} else if (!processedUrl.startsWith("http")) {
		processedUrl = `https://${processedUrl}`;
	}

	const frame = document.getElementById('frame');
	if (frame) {
		frame.src = scramjet.encodeUrl(processedUrl);
	}
}

function goBack() {
	const frame = document.getElementById('frame');
	if (frame && frame.contentWindow) {
		frame.contentWindow.history.back();
	}
}

function goForward() {
	const frame = document.getElementById('frame');
	if (frame && frame.contentWindow) {
		frame.contentWindow.history.forward();
	}
}

function reload() {
	const frame = document.getElementById('frame');
	if (frame) {
		frame.src = frame.src;
	}
}

function openInNewTab() {
	const frame = document.getElementById('frame');
	if (frame && frame.src) {
		window.open(frame.src, '_blank');
	}
}

document.addEventListener('DOMContentLoaded', async function() {
	if (window.lucide) lucide.createIcons();

	var frame = document.getElementById('frame');
	
	function showWelcome() {
		var welcomeHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head>
    <body style="background:#fff; font-family:sans-serif; height:100vh; margin:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
      <h1 style="color:#111; margin-bottom:10px; font-weight: 800; font-size: 2.5rem; letter-spacing: -1px;">this is a really cool proccy u should use</h1>
      <p style="color:#666; margin-bottom: 30px;">join the discord!</p>
      <p style="color:#999; font-size: 14px;">Use the URL bar above to navigate</p>
    </body></html>`;
		frame.srcdoc = welcomeHtml;
	}

	await initializeProxy();
	showWelcome();

	const backButton = document.getElementById('back');
	const nextButton = document.getElementById('next');
	const redoButton = document.getElementById('redo');
	const openButton = document.getElementById('open');
	const urlInput = document.getElementById('url');

	if (backButton) backButton.addEventListener('click', goBack);
	if (nextButton) nextButton.addEventListener('click', goForward);
	if (redoButton) redoButton.addEventListener('click', reload);
	if (openButton) openButton.addEventListener('click', openInNewTab);

	if (urlInput) {
		urlInput.addEventListener('keypress', function(e) {
			if (e.key === 'Enter') {
				navigateToUrl(this.value);
			}
		});
	}
});