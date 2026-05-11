// Copyright 2024 the developers-conferences-agenda contributors
// SPDX-License-Identifier: Apache-2.0

"use strict";

const { FuzzedDataProvider } = require("@jazzer.js/core");

// Replicate the date/month parsing logic from mdParser.js
const MONTHS_NAMES =
  "january,february,march,april,may,june,july,august,september,october,november,december".split(
    ","
  );
const MONTHS_SHORTNAMES = MONTHS_NAMES.map((m) => m.slice(0, 3));

const getTimeStamp = (year, month, day) =>
  new Date(Date.UTC(year, month, day, 0, 0, 0)).getTime();

/**
 * Parse a date string like "6-7" or "06/12-07/12" as used in mdParser.js
 * @param {string} dateStr
 * @param {number} year
 */
function parseConferenceDate(dateStr, year) {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length === 0) return null;

  const firstPart = parts[0].split("/");
  const day = parseInt(firstPart[0], 10);
  const month = firstPart.length > 1 ? parseInt(firstPart[1], 10) - 1 : 0;

  if (isNaN(day) || isNaN(month)) return null;
  return getTimeStamp(year, month, day);
}

/**
 * Fuzz the date/month parsing logic used in mdParser.js.
 * @param {Buffer} data
 */
module.exports.fuzz = function (data) {
  const provider = new FuzzedDataProvider(data);
  const dateStr = provider.consumeString(64);
  const year = provider.consumeIntegralInRange(1970, 2100);

  // Must not throw or produce unexpected results
  try {
    parseConferenceDate(dateStr, year);

    // Test month name matching
    const lowerStr = dateStr.toLowerCase();
    MONTHS_NAMES.findIndex((m) => lowerStr.startsWith(m));
    MONTHS_SHORTNAMES.findIndex((m) => lowerStr.startsWith(m));
  } catch (e) {
    if (e instanceof RangeError) return; // Invalid date values are expected
    throw e;
  }
};
