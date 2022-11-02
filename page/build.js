const path = require('path');
const { existsSync, readFileSync, readdirSync, writeFileSync, copyFileSync, mkdirSync } = require('fs');

const { compile } = require('sass');
const { transformFileSync, minifySync } = require('@swc/core');

let src = {
	scss: path.resolve(__dirname, "src/", "scss/"),
	js: path.resolve(__dirname, "src/", "js/"),
	imgs: path.resolve(__dirname, "src/", "imgs/"),
	html: path.resolve(__dirname, "src/")
};
let dist = {
	scss: path.resolve(__dirname, "dist/", "css/"),
	js: path.resolve(__dirname, "dist/", "js/"),
	imgs: path.resolve(__dirname, "dist/", "imgs/"),
	html: path.resolve(__dirname, "dist/")
};
let opts;

////////////////////////////
// SASS Compilation
////////////////////////////
opts = {
	loadPaths: [src.scss],
	style: "compressed"
};

mkdirSync(dist.scss, { recursive: true });
if (existsSync(src.scss)) {
	for (const filename of readdirSync(src.scss)) {
		let srcName = path.resolve(src.scss, filename);
		console.log("[*] Compiling", srcName);
		let { css } = compile(srcName, opts);
		let outputName = filename.replace('scss', 'css');
		outputName = path.resolve(dist.scss, outputName);
		console.log("[*] Writing to", outputName);
		writeFileSync(outputName, css);
	}
}

////////////////////////////
// JS Minify
////////////////////////////
mkdirSync(dist.js, { recursive: true });
if (existsSync(src.js)) {
	for (const filename of readdirSync(src.js)) {
		let srcName = path.resolve(src.js, filename);
		console.log("[*] Minifiying", srcName);
		let outputName = path.resolve(dist.js, filename);
		let {code} = transformFileSync(srcName, {
			isModule: false,
			jsc: { target: 'es2015' }
		});
		let {code: minified} = minifySync(code, {
			compress: true,
			mangle: true
		});
		writeFileSync(outputName, minified);
	}
}

////////////////////////////
// Image Assets
////////////////////////////
mkdirSync(dist.imgs, { recursive: true });
if (existsSync(src.imgs)) {
	for (const filename of readdirSync(src.imgs)) {
		let srcName = path.resolve(src.imgs, filename);
		console.log("[*] Exporting", srcName);
		let outputName = path.resolve(dist.imgs, filename);
		copyFileSync(srcName, outputName);
	}
}

////////////////////////////
// HTML Pages
////////////////////////////
mkdirSync(dist.html, { recursive: true });
if (existsSync(src.html)) {
	for (const filename of readdirSync(src.html)) {
		if (!filename.endsWith('.html')) continue;

		let srcName = path.resolve(src.html, filename);
		console.log("[*] Exporting", srcName);
		let outputName = path.resolve(dist.html, filename);
		copyFileSync(srcName, outputName);
	}
}
