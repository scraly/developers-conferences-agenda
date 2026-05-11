// Copyright 2024 the developers-conferences-agenda contributors
// SPDX-License-Identifier: Apache-2.0

"use strict";

const { FuzzedDataProvider } = require("@jazzer.js/core");

// Replicate the validation patterns from mdValidator.js
const confIdentifierPattern = /^ *\* ?(\[.*\]\s?)?[0-9?x\/-]+/;
const confValidationPattern =
  /^\*( \[(?<status>[\w ]+)\])? (?<date>\d{1,2}(\/\d{1,2})?(-\d{1,2})?(\/\d{1,2})?)\s?: \[(?<name>[^\]]*)\]\((?<link>https?:\S*)\)( - (?<place>[^<\n]*))?/;

/**
 * Fuzz the markdown validator logic used to parse conference lines.
 * @param {Buffer} data
 */
module.exports.fuzz = function (data) {
  const provider = new FuzzedDataProvider(data);
  const line = provider.consumeString(512);

  // Test the patterns against arbitrary input — must not throw or crash
  try {
    const isConfLine = !!line.match(confIdentifierPattern);
    if (isConfLine) {
      line.match(confValidationPattern);
    }

    // Test date extraction hints similar to addHints()
    const hasLongDash = line.includes("—") || line.includes("–");
    const hasHttp = line.includes("http");
    const hasMultipleSpaces = !!line.match(/\s{2,}/);
    const hasCFPLabel = line.includes("label=CFP");
    const hasShield = line.includes("img.shields.io");

    if (hasCFPLabel) {
      line.match(
        /<a.*label=CFP.*([a-zA-Z]+-\d{2}-\d{4}|\d{2}-[a-zA-Z]+-\d{4}|\d{4}-[a-zA-Z]+-\d{2})&.*<\/a>/
      );
    }
    if (hasShield) {
      line.match(/>\s*$/);
    }
  } catch (e) {
    // Regex errors on invalid input should not crash the validator
    if (e instanceof SyntaxError) return;
    throw e;
  }
};
