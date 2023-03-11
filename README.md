uberboard.io CLI
=================

uberboard.io CLI

![GitHub branch checks state](https://img.shields.io/github/checks-status/uberboard/uberboard-cli/main)
![GitHub package.json version](https://img.shields.io/github/package-json/v/uberboard/uberboard-cli)
![GitHub](https://img.shields.io/github/license/uberboard/uberboard-cli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g uberboard-cli
$ uberboard COMMAND
running command...
$ uberboard (--version)
uberboard-cli/1.0.2-0 darwin-arm64 node-v19.6.0
$ uberboard --help [COMMAND]
USAGE
  $ uberboard COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`uberboard help [COMMANDS]`](#uberboard-help-commands)
* [`uberboard plugins`](#uberboard-plugins)
* [`uberboard plugins:install PLUGIN...`](#uberboard-pluginsinstall-plugin)
* [`uberboard plugins:inspect PLUGIN...`](#uberboard-pluginsinspect-plugin)
* [`uberboard plugins:install PLUGIN...`](#uberboard-pluginsinstall-plugin-1)
* [`uberboard plugins:link PLUGIN`](#uberboard-pluginslink-plugin)
* [`uberboard plugins:uninstall PLUGIN...`](#uberboard-pluginsuninstall-plugin)
* [`uberboard plugins:uninstall PLUGIN...`](#uberboard-pluginsuninstall-plugin-1)
* [`uberboard plugins:uninstall PLUGIN...`](#uberboard-pluginsuninstall-plugin-2)
* [`uberboard plugins update`](#uberboard-plugins-update)
* [`uberboard update [CHANNEL]`](#uberboard-update-channel)

## `uberboard help [COMMANDS]`

Display help for uberboard.

```
USAGE
  $ uberboard help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for uberboard.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.7/src/commands/help.ts)_

## `uberboard plugins`

List installed plugins.

```
USAGE
  $ uberboard plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ uberboard plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.3.2/src/commands/plugins/index.ts)_

## `uberboard plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ uberboard plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ uberboard plugins add

EXAMPLES
  $ uberboard plugins:install myplugin 

  $ uberboard plugins:install https://github.com/someuser/someplugin

  $ uberboard plugins:install someuser/someplugin
```

## `uberboard plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ uberboard plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ uberboard plugins:inspect myplugin
```

## `uberboard plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ uberboard plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ uberboard plugins add

EXAMPLES
  $ uberboard plugins:install myplugin 

  $ uberboard plugins:install https://github.com/someuser/someplugin

  $ uberboard plugins:install someuser/someplugin
```

## `uberboard plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ uberboard plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ uberboard plugins:link myplugin
```

## `uberboard plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ uberboard plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ uberboard plugins unlink
  $ uberboard plugins remove
```

## `uberboard plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ uberboard plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ uberboard plugins unlink
  $ uberboard plugins remove
```

## `uberboard plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ uberboard plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ uberboard plugins unlink
  $ uberboard plugins remove
```

## `uberboard plugins update`

Update installed plugins.

```
USAGE
  $ uberboard plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

## `uberboard update [CHANNEL]`

update the uberboard CLI

```
USAGE
  $ uberboard update [CHANNEL] [-a] [-v <value> | -i] [--force]

FLAGS
  -a, --available        Install a specific version.
  -i, --interactive      Interactively select version to install. This is ignored if a channel is provided.
  -v, --version=<value>  Install a specific version.
  --force                Force a re-download of the requested version.

DESCRIPTION
  update the uberboard CLI

EXAMPLES
  Update to the stable channel:

    $ uberboard update stable

  Update to a specific version:

    $ uberboard update --version 1.0.0

  Interactively select version:

    $ uberboard update --interactive

  See available versions:

    $ uberboard update --available
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v3.1.6/src/commands/update.ts)_
<!-- commandsstop -->
