/**
 * utils contains utility functions for testing.
 * @module utils
 */

/**
 * sleep sleeps for the given time in milliseconds in async manner
 * @param {number} ms - Time to sleep in milliseconds.
 */
export async function sleep(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
