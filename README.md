# Blockless CLI
The Blockless CLI is a command line tool that makes it easy to interact with the Blockless Network and build and manage your applications. 

With the Blockless CLI, you can connect to the network via your on-chain identity, construct a local worker environment with one click, and build, test, deploy, and monitor your projects in real time.

## Installation
With `curl`:

```sh
sudo sh -c "curl https://raw.githubusercontent.com/BlocklessNetwork/cli/main/download.sh | bash"
```

Or with `wget`:

```sh
sudo sh -c "wget https://raw.githubusercontent.com/BlocklessNetwork/cli/main/download.sh -v -O download.sh; chmod +x download.sh; ./download.sh; rm -rf download.sh"
```

To install on Windows, go to the [releases page](https://github.com/blocklessnetwork/cli/releases) on GitHub and download the x86 version of the Blockless CLI. Currently, the Windows ARM64 version is not supported.

## Usage

To use the BLS CLI, open a terminal and run `bls` followed by the command you want to use. The command structure is as follows:

```sh
bls [command] [subcommand]
```

For example, to connect to the Blockless Network, you can run the `bls login` command:

```sh
bls login
```

Alternatively, you can use the `bls function init` command to initialize a new local project:

```sh
bls function init
```

### Help

To see a list of available commands, you can run the `bls` or `bls help` command:

```sh
bls help
```

You can also use the `-h` or `--help` flag after any command or subcommand to display usage information. For example:

```sh
bls function -h
bls function init -h
```

## Top level commands
The Blockless CLI provides a range of commands for managing your account, local components, and projects. For detailed reference, please visit the [Blockless CLI Reference](https://blockless.network/docs/developer-tools/cli/quick-start).

Below is a list of commonly used commands:

- `bls help`: Displays information and usage instructions for the Blockless CLI and its available subcommands.
- `bls console`: Opens the Blockless console, a web-based interface for managing your deployments and projects on the Blockless Network.
- `bls login`: Authenticates and logs in to the Blockless Network using your wallet keypair.
- `bls whoami`: Shows information about your current identity on the Blockless Network, including your public key.
- `bls components`: Manages your local environment components, including the local worker agent and orchestrator agent.
- `bls function`: Build, test, and manage your projects and functions.
  

## Glboal flags
Other than the help (`-h` or `--help`) global flag, there are two more flags that you can use globally.

### `--yes` flag
You can use `-y` or `--yes` flag to set all options to the default value. For example:

```sh
bls function deploy -y
```

### `--version` flag
`-v` or `--version` flag can be used to verify the current version of the Blockless CLI:

```sh
bls -v
```

## Blockless CLI reference

For detailed reference, please visit the [Blockless CLI Reference](https://blockless.network/docs/cli-reference).

## Contributing

The Blockless CLI is written in `typescript` and packaged using vercel's `pkg` library.

- Node 14.17
- Typescript
- Pkg Wrapper

Use `dev-bin.js` to test locally or use `npm link` to test bin globally installed.
