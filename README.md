# Jibe

Jibe implements some of the navigator.apps API

## Installation

Be sure you check out this project including its submodule (via `git submodule update`).

Install Node, version 0.4.11 (some prerequesites do not work with Node 0.5.x).

Install `express` and `redis`, and have a Redis server running.

Run `node server/server.js` to setup the backing server, then run a
static site (which will be the dashboard) from the base directory
(using Apache or whatever you like).
